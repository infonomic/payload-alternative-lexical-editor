'use client'

import { useEffect } from 'react'

import {
  type ToolbarExtensionItem,
  useToolbarExtensions,
} from '@infonomic/payload-alternative-lexical-editor/field/toolbar-extensions'
import { $getSelection, $isRangeSelection } from 'lexical'

export function HelloFeature(): React.JSX.Element | null {
  const { editor, register } = useToolbarExtensions()

  useEffect(() => {
    const item: ToolbarExtensionItem = {
      id: 'demo-hello-toolbar-button',
      order: 100_010,
      node: (
        <button
          type="button"
          className="toolbar-item spaced"
          onClick={() => {
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) {
                selection.insertText('Hello from feature! ')
              }
            })
          }}
        >
          Hello
        </button>
      ),
    }

    return register(item)
  }, [editor, register])

  return null
}
