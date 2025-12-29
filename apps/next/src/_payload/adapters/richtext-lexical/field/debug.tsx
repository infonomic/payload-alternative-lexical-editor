'use client'

import type * as React from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { CLEAR_EDITOR_COMMAND } from 'lexical'

export function Debug(): React.JSX.Element {
  const [editor] = useLexicalComposerContext()

  function handleOnSave(): void {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(editor.getEditorState()))
  }

  function handleOnClear(): void {
    editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
    editor.focus()
  }

  return (
    <div className="editor-actions">
      <button type="button" onClick={handleOnSave}>
        Save
      </button>
      <button type="button" onClick={handleOnClear}>
        Clear
      </button>
    </div>
  )
}
