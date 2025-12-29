import type { EditorConfig as LexicalEditorConfig, SerializedEditorState } from 'lexical'
import type {
  DefaultServerCellComponentProps,
  RichTextAdapter,
  RichTextFieldClient,
  RichTextFieldClientProps,
  ServerFieldBase,
} from 'payload'

import type { InitialLexicalFormState } from './field/build-initial-state'
import type { ClientEditorConfig, EditorConfig, EditorSettings } from './field/config/types'

export interface LexicalEditorProps {
  admin?: LexicalFieldAdminProps
  settings?: (config: EditorSettings) => EditorSettings
  lexical?: LexicalEditorConfig
}

export interface AdapterProps {
  editorConfig: EditorConfig
}

// export type LexicalRichTextAdapter = RichTextAdapter<
//   SerializedEditorState,
//   AdapterProps,
//   object
// > & {
//   editorConfig: EditorConfig
// }

export type LexicalRichTextAdapter = {
  editorConfig: EditorConfig
} & RichTextAdapter<SerializedEditorState, AdapterProps>

export type LexicalFieldAdminProps = {
  /**
   * Controls if the gutter (padding to the left & gray vertical line) should be hidden. @default false
   */
  hideGutter?: boolean
}

export type LexicalRichTextFieldProps = {
  admin?: LexicalFieldAdminProps
  initialLexicalFormState: InitialLexicalFormState
  editorConfig: ClientEditorConfig
} & Pick<ServerFieldBase, 'permissions'> &
  RichTextFieldClientProps<SerializedEditorState, AdapterProps, object>

export type LexicalRichTextCellProps = DefaultServerCellComponentProps<
  RichTextFieldClient<SerializedEditorState, AdapterProps, object>,
  SerializedEditorState
>
