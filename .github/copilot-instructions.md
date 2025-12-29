# Copilot instructions (Payload Alternative Lexical Editor)

## Repo shape / big picture
- Monorepo managed by **pnpm workspaces** + **Turborepo** (root `package.json`, `turbo.json`).
- Demo app lives in `apps/next` (Next.js 16 + Payload 3.69).
- The custom Lexical rich text **adapter/editor source currently lives in** `apps/next/src/_payload/adapters/richtext-lexical`.
- Packaging is in-progress: expect this adapter/editor to move into `packages/payload-alternative-lexical-editor` soon for publishing to npm.
  - Today that package is not yet wired up (its `src/index.ts` is still a stub).

## Key integration points
- Payload config: `apps/next/src/payload.config.ts` uses `editor: lexicalEditor()` imported from `@/_payload/adapters/richtext-lexical`.
- Field presets that toggle editor features:
  - Minimal: `apps/next/src/_payload/fields/richtext-minimal/index.ts`
  - Compact: `apps/next/src/_payload/fields/richtext-compact/index.ts`
- Adapter entrypoint: `apps/next/src/_payload/adapters/richtext-lexical/index.ts`.
  - Registers hooks:
    - `beforeChange`: `.../field/lexical-before-change-populate-links.ts` (adds `attributes.doc.data` for internal links)
    - `afterRead`: `.../field/lexical-after-read-populate-media.ts` (populates inline-image doc data)
  - Alternative (more expensive) link strategy exists at `.../field/lexical-after-read-populate-links.ts`.

## Editor runtime architecture (why it’s structured this way)
- The RSC bridge lives in:
  - Field: `.../field/rsc-entry.tsx` (builds initial form state and renders the client field)
  - Cell: `.../cell/rsc-entry.tsx` (renders text preview in admin list views)
- The editor uses shared contexts to support nested composers and to propagate changes:
  - `.../field/context/shared-on-change-context.tsx`
  - `.../field/context/shared-history-context.tsx`
- Avoiding “echo” updates is critical:
  - `.../field/apply-value-plugin.tsx` applies external form values with `APPLY_VALUE_TAG`
  - `.../field/editor.tsx` ignores `APPLY_VALUE_TAG` in `OnChangePlugin`
  - `.../field/field-component.tsx` hashes serialized state to avoid re-emitting identical values

## Local dev workflows (prefer these)
- Install: `pnpm install`
- Run app (root): `pnpm dev` (runs turbo dev in parallel)
- Build / start (root): `pnpm build` then `pnpm start`
- Lint: `pnpm lint`

## Database
- Default is MongoDB (`apps/next/.env.example` uses `MONGODB_URI`).
- Start Mongo via docker compose: `cd mongodb && mkdir -p data && ./mongo.sh up`.
- Postgres is present but currently commented out in `apps/next/src/payload.config.ts` (see `apps/next/start-database.sh`).

## Conventions / gotchas
- Path alias: in `apps/next/tsconfig.json`, `@/*` maps to `apps/next/src/*`.
- Formatting/linting is via **Biome** (root `biome.jsonc`). `_payload` is included; generated `payload-types.ts` is excluded.
- When editing Lexical initialization, be careful with React memo/deps in `.../field/editor-context.tsx` to avoid focus loss / remount loops.
