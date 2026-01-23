'use client'

import { useEffect } from 'react'

import {
  type ToolbarExtensionItem,
  useToolbarExtensions,
} from '@infonomic/payload-alternative-lexical-editor/field/toolbar-extensions'

export function FooFeature(): React.JSX.Element {
  const { register } = useToolbarExtensions()

  useEffect(() => {
    const item: ToolbarExtensionItem = {
      id: 'demo-foo-toolbar-button',
      order: 100_000,
      node: (
        <button
          type="button"
          className="toolbar-item spaced"
          onClick={() => {
            // eslint-disable-next-line no-alert
            alert('Foo toolbar button clicked')
          }}
        >
          Foo
        </button>
      ),
    }
    return register(item)
  }, [register])

  return (
    <div
      style={{
        padding: '8px 0',
        fontSize: 12,
        opacity: 0.8,
      }}
    >
      Foo says: hello
    </div>
  )
}
