'use client'

import type * as React from 'react'
import { useEffect, useRef } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { SerializedEditorState } from 'lexical'

import { APPLY_VALUE_TAG } from './constants'
import { hashSerializedState } from './utils/hashSerializedState'

export function ApplyValuePlugin({
  value,
  lastEmittedHashRef,
  normalizedIncomingHashRef,
  hasNormalizedBaselineRef,
}: {
  value?: SerializedEditorState | null
  lastEmittedHashRef: React.RefObject<string | undefined>
  normalizedIncomingHashRef: React.RefObject<string | undefined>
  hasNormalizedBaselineRef: React.RefObject<boolean>
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const lastAppliedHashRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (value == null) return

    const nextRawHash = hashSerializedState(value)

    if (nextRawHash === lastAppliedHashRef.current) return
    if (nextRawHash === lastEmittedHashRef.current) return

    // We are about to apply a new external value. While Lexical applies it (and runs transforms),
    // it may emit untagged updates (tags: []). Keep the baseline "not ready" until we can capture
    // the settled editorState.
    hasNormalizedBaselineRef.current = false

    const nextState = editor.parseEditorState(value)

    editor.update(
      () => {
        editor.setEditorState(nextState)
      },
      { tag: APPLY_VALUE_TAG }
    )

    let cancelled = false
    // Capture what Lexical *actually* settled on after applying + running immediate transforms.
    // Two rAFs helps ensure we’re past the commit + plugin side-effects.
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (cancelled) return
          const settled = editor.getEditorState().toJSON() as SerializedEditorState
          normalizedIncomingHashRef.current = hashSerializedState(settled)
          hasNormalizedBaselineRef.current = true
        })
      })
    })

    lastAppliedHashRef.current = nextRawHash
    return () => {
      cancelled = true
    }
  }, [editor, value, lastEmittedHashRef, normalizedIncomingHashRef, hasNormalizedBaselineRef])

  return null
}
