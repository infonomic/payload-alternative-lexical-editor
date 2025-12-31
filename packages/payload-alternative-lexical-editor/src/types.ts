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

export type CollectionAlias = {
  slug: string
  alias: string
}

export interface LexicalEditorProps {
  admin?: LexicalFieldAdminProps
  settings?: (config: EditorSettings) => EditorSettings
  lexical?: LexicalEditorConfig
  collectionAliases?: CollectionAlias[]
}

export interface AdapterProps {
  editorConfig: EditorConfig
}

// export type LexicalAdapter = RichTextAdapter<
//   SerializedEditorState,
//   AdapterProps,
//   object
// > & {
//   editorConfig: EditorConfig
// }

export type LexicalAdapter = {
  editorConfig: EditorConfig
} & RichTextAdapter<SerializedEditorState, AdapterProps>

export type LexicalFieldAdminProps = {
  /**
   * Controls if the gutter (padding to the left & gray vertical line) should be hidden. @default false
   */
  hideGutter?: boolean
}

export type EditorFieldProps = {
  admin?: LexicalFieldAdminProps
  initialLexicalFormState: InitialLexicalFormState
  editorConfig: ClientEditorConfig
} & Pick<ServerFieldBase, 'permissions'> &
  RichTextFieldClientProps<SerializedEditorState, AdapterProps, object>

export type EditorCellProps = DefaultServerCellComponentProps<
  RichTextFieldClient<SerializedEditorState, AdapterProps, object>,
  SerializedEditorState
>
