'use client'
import * as React from 'react'
import { useMemo } from 'react'

import { LexicalComposer } from '@lexical/react/LexicalComposer'

import { EditorConfigContext } from './config/editor-config-context'
import { SharedHistoryContext } from './context/shared-history-context'
import { SharedOnChangeContext } from './context/shared-on-change-context'
import { Editor } from './editor'
import { Nodes } from './nodes'

import type { ClientEditorConfig } from './config/types'
import type { InitialConfigType } from '@lexical/react/LexicalComposer'
import type { LexicalEditor, EditorState, SerializedEditorState } from 'lexical'
import { RichTextFieldClientProps } from 'payload'
import { AdapterProps } from '../types'

export function EditorContext(props: {
  children?: React.ReactNode
  composerKey: string
  editorConfig: ClientEditorConfig
  fieldProps: RichTextFieldClientProps<SerializedEditorState, AdapterProps, any>
  onChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void
  readOnly: boolean
  value?: SerializedEditorState | null
}): React.JSX.Element {
  const { children, composerKey, editorConfig, onChange, fieldProps, readOnly, value } = props

  // useMemo for the initialConfig that depends on readOnly and value
  const initialConfig = useMemo<InitialConfigType>(() => {
    return {
      editable: readOnly !== true,
      editorState: value != null ? JSON.stringify(value) : undefined,
      namespace: editorConfig.lexical.namespace,
      nodes: [...Nodes],
      onError: (error: Error) => {
        throw error
      },
      theme: editorConfig.lexical.theme,
    }
    // Important: do not add readOnly and value to the dependencies array. 
    // This will cause the entire lexical editor to re-render if the document 
    // is saved, which will cause the editor to lose focus.
    
    // NOTE: 2025-04-26: This is NOT the case for our version of the editor.
    // Without readOnly as a dependency, the editor will never transition
    // from readOnly to editable during form loading, when disabledFromField
    // in field-component will be briefly false.
  }, [editorConfig, readOnly])
  
  
  if (initialConfig == null) {
    return <p>Loading...</p>
  }

  return (
    <LexicalComposer initialConfig={initialConfig} key={composerKey + initialConfig.editable} >
      <EditorConfigContext config={editorConfig.settings}>
        <SharedOnChangeContext onChange={onChange}>
          <SharedHistoryContext>
            <div className="editor-shell">
              <Editor />
              {children}
            </div>
          </SharedHistoryContext>
        </SharedOnChangeContext>
      </EditorConfigContext>
    </LexicalComposer>
  )
}
