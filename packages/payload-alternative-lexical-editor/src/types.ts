import type React from 'react'

import type { EditorConfig as LexicalEditorConfig, SerializedEditorState } from 'lexical'
import type {
  DefaultServerCellComponentProps,
  RichTextAdapter,
  RichTextFieldClient,
  RichTextFieldClientProps,
  ServerFieldBase,
} from 'payload'

import type { InitialLexicalFormState } from './field/build-initial-state'
import type {
  ClientEditorConfig,
  EditorConfig,
  EditorSettings,
  LexicalEditorFeatureSlots,
} from './field/config/types'

export type { LexicalEditorFeatureSlots } from './field/config/types'

export type CollectionAlias = {
  slug: string
  alias: string
}

export interface LexicalEditorProps {
  admin?: LexicalFieldAdminProps
  settings?: (config: EditorSettings) => EditorSettings
  lexical?: LexicalEditorConfig
  collectionAliases?: CollectionAlias[]
  /**
   * Adapter-level feature slots. These are RSC-safe and are resolved via Payload's importMap.
   */
  features?: LexicalEditorFeatureSlots
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
  /**
   * Resolved (rendered) adapter-level feature slots coming from the server RSC entry.
   */
  featureBeforeEditor?: React.ReactNode
  featureAfterEditor?: React.ReactNode
  featureChildren?: React.ReactNode
} & Pick<ServerFieldBase, 'permissions'> &
  RichTextFieldClientProps<SerializedEditorState, AdapterProps, object>

export type EditorCellProps = DefaultServerCellComponentProps<
  RichTextFieldClient<SerializedEditorState, AdapterProps, object>,
  SerializedEditorState
>
