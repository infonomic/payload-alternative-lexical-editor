import type { EditorSettings } from './config/types'
import type { EditorState, LexicalEditor } from 'lexical'

export interface OnChangeProps {
  onChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void
  initialJSON: any
  config: EditorSettings
  value: any
  setValue: (value: any) => void
}
