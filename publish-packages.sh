#!/usr/bin/env bash
#
# publish-packages.sh — publish @infonomic/payload-alternative-lexical-editor
# to npm under passkey 2FA.
#
# Why this exists: `pnpm publish` / `changeset publish` cannot publish under
# passkey-only 2FA — pnpm's OTP pre-check accepts only a typed numeric code and
# dead-ends at ERR_PNPM_OTP_NON_INTERACTIVE. Plain `npm publish` honours the
# bypass token in ~/.npmrc silently. But plain npm does NOT rewrite pnpm's
# `workspace:*` deps — so we `pnpm pack` first (which rewrites them into real
# versions) and `npm publish <tarball>` the result.
#
# This script is meant to run AFTER the release commit (`chore(release): X.Y.Z`)
# is made — i.e. in place of the manual `pnpm publish` flow. It builds, packs,
# publishes, and pushes the release tag. It is idempotent: a package already
# live at the current version is skipped, and an existing tag is not recreated —
# so re-running after a partial failure just finishes the job.
#
# Usage:
#   ./publish-packages.sh            # build, publish, tag, push (prompts before publishing)
#   ./publish-packages.sh --dry-run  # pack + verify only; no publish, no tags, no push
#   ./publish-packages.sh --no-build # skip the turbo build (use existing dist/)
#   ./publish-packages.sh --yes      # skip the confirmation prompt
#
set -euo pipefail

# ---- the one public package -----------------------------------------------
PKG_NAME="@infonomic/payload-alternative-lexical-editor"
PKG_DIR="payload-alternative-lexical-editor"   # packages/<PKG_DIR>

# ---- options --------------------------------------------------------------
DRY_RUN=0
DO_BUILD=1
ASSUME_YES=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --no-build) DO_BUILD=0 ;;
    --yes|-y) ASSUME_YES=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

# ---- colours --------------------------------------------------------------
if [ -t 1 ]; then
  BOLD=$'\033[1m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=""; GREEN=""; YELLOW=""; RED=""; DIM=""; RESET=""
fi
info()  { echo "${BOLD}$*${RESET}"; }
ok()    { echo "${GREEN}$*${RESET}"; }
warn()  { echo "${YELLOW}$*${RESET}"; }
die()   { echo "${RED}error: $*${RESET}" >&2; exit 1; }

# ---- locate repo ----------------------------------------------------------
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

command -v node >/dev/null || die "node not found on PATH"
command -v npm  >/dev/null || die "npm not found on PATH"
command -v pnpm >/dev/null || die "pnpm not found on PATH"

PKG_JSON="packages/${PKG_DIR}/package.json"
[ -f "$PKG_JSON" ] || die "could not find ${PKG_JSON}"

# Sweep any pack tarballs on exit (normal, error, or interrupt) so a failed
# publish never leaves a stray *.tgz behind in the package dir.
cleanup_tarballs() {
  find "$REPO_ROOT/packages" -maxdepth 2 -name '*.tgz' -delete 2>/dev/null || true
}
trap cleanup_tarballs EXIT INT TERM

# ---- version --------------------------------------------------------------
VERSION="$(node -e "console.log(require('./${PKG_JSON}').version)")"
[ -n "$VERSION" ] || die "could not read version from ${PKG_JSON}"

TAG="${PKG_NAME}@${VERSION}"

# ---- preflight reporting --------------------------------------------------
ANCHOR="$(git rev-parse HEAD)"
ANCHOR_SHORT="$(git rev-parse --short HEAD)"
HEAD_SUBJECT="$(git log -1 --pretty=%s)"

info "payload-alternative-lexical-editor publish"
echo "  repo:    $REPO_ROOT"
echo "  package: ${BOLD}${PKG_NAME}${RESET}"
echo "  version: ${BOLD}${VERSION}${RESET}"
echo "  anchor:  ${ANCHOR_SHORT}  ${DIM}${HEAD_SUBJECT}${RESET}"
echo "  tag:     ${TAG}"
[ "$DRY_RUN" -eq 1 ] && warn "  mode:    DRY RUN (no publish / no tag / no push)"
echo

# Soft check: HEAD should be the release commit.
case "$HEAD_SUBJECT" in
  "chore(release): $VERSION") : ;;
  *) warn "HEAD subject is not 'chore(release): $VERSION' — make sure you're on the release commit before tagging." ;;
esac

# Warn if the working tree is dirty.
if [ -n "$(git status --porcelain)" ]; then
  warn "Working tree is not clean:"
  git status --short
  warn "The tag will point at $ANCHOR_SHORT regardless. Stash/revert unrelated changes before tagging."
  echo
fi

# ---- determine work: is it already published? -----------------------------
PUBLISHED="$(npm view "${PKG_NAME}@${VERSION}" version 2>/dev/null || true)"
if [ "$PUBLISHED" = "$VERSION" ]; then
  ALREADY=1
  echo "${DIM}${PKG_NAME}@${VERSION} is already published — will not re-publish.${RESET}"
  echo
else
  ALREADY=0
  info "To publish:"
  echo "  - ${PKG_NAME}@${VERSION}"
  echo
fi

# ---- confirm --------------------------------------------------------------
if [ "$DRY_RUN" -eq 0 ] && [ "$ALREADY" -eq 0 ] && [ "$ASSUME_YES" -eq 0 ]; then
  read -r -p "Publish ${PKG_NAME}@${VERSION} to npm? This is not reversible. [y/N] " reply
  case "$reply" in [yY]|[yY][eE][sS]) : ;; *) die "aborted by user" ;; esac
  echo
fi

# ---- build ----------------------------------------------------------------
if [ "$DO_BUILD" -eq 1 ] && { [ "$ALREADY" -eq 0 ] || [ "$DRY_RUN" -eq 1 ]; }; then
  info "Building ${PKG_NAME}…"
  pnpm turbo run build --filter="${PKG_NAME}"
  echo
fi

# ---- pack + publish -------------------------------------------------------
ensure_tag() {
  if git rev-parse -q --verify "refs/tags/${TAG}" >/dev/null 2>&1; then
    local at; at="$(git rev-list -n1 "${TAG}")"
    if [ "$at" != "$ANCHOR" ]; then
      warn "tag ${TAG} exists but points at ${at:0:8}, not ${ANCHOR_SHORT} — leaving as-is"
    fi
  else
    git tag "${TAG}" "${ANCHOR}"
    echo "  tagged ${TAG}"
  fi
}

if [ "$ALREADY" -eq 0 ]; then
  echo "${BOLD}── ${PKG_NAME} ──${RESET}"
  (
    cd "packages/${PKG_DIR}"
    rm -f ./*.tgz
    pnpm pack >/dev/null 2>&1 || { echo "${RED}pnpm pack failed${RESET}"; exit 1; }
    tgz="$(ls -t ./*.tgz 2>/dev/null | head -1)"
    [ -n "$tgz" ] || { echo "${RED}no tarball produced${RESET}"; exit 1; }
    # Guard: no unrewritten workspace: deps may ship.
    if tar -xzO -f "$tgz" package/package.json | grep -q '"workspace:'; then
      echo "${RED}WORKSPACE LEAK in $tgz — refusing to publish${RESET}"; exit 1
    fi
    if [ "$DRY_RUN" -eq 1 ]; then
      echo "  ${DIM}dry-run: packed $(basename "$tgz"), verified clean (not publishing)${RESET}"
    else
      npm publish "$tgz" --access public
    fi
    rm -f ./*.tgz
  ) || die "failed on ${PKG_NAME} — fix and re-run (an already-published package is skipped)"
  echo
fi

# ---- tag ------------------------------------------------------------------
if [ "$DRY_RUN" -eq 0 ]; then
  ensure_tag
fi

# ---- push tag -------------------------------------------------------------
if [ "$DRY_RUN" -eq 0 ]; then
  info "Pushing tag ${TAG}…"
  git push origin "${TAG}"
  echo
fi

# ---- done -----------------------------------------------------------------
if [ "$DRY_RUN" -eq 1 ]; then
  ok "Dry run complete — tarball packed and verified clean. Nothing published."
else
  ok "Done: ${PKG_NAME}@${VERSION} live on npm, tag ${TAG} pushed."
fi
