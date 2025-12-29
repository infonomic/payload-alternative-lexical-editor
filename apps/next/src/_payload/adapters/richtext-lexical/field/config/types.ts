
import type { EditorConfig as LexicalEditorConfig } from 'lexical'

import type { LexicalFieldAdminProps } from '../../types'

export type OptionName =
  | 'disableBeforeInput'
  | 'autocomplete'
  | 'charLimit'
  | 'charLimitUtf8'
  | 'collab'
  | 'maxLength'
  | 'richText'
  | 'measureTypingPerf'
  | 'showNestedEditorTreeView'
  | 'showTableOfContents'
  | 'showTreeView'
  | 'textAlignment'
  | 'tablePlugin'
  | 'tableCellBackgroundColor'
  | 'tableCellMerge'
  | 'tableActionMenuPlugin'
  | 'layoutPlugin'
  | 'outputHTML'
  | 'outputMarkdown'
  | 'autoFocusPlugin'
  | 'autoLinkPlugin'
  | 'inlineImagePlugin'
  | 'admonitionPlugin'
  | 'checkListPlugin'
  | 'listPlugin'
  | 'codeHighlightPlugin'
  | 'horizontalRulePlugin'
  | 'markdownShortcutPlugin'
  | 'undoRedo'
  | 'textStyle'
  | 'inlineCode'
  | 'links'
  | 'floatingLinkEditorPlugin'
  | 'floatingTextFormatToolbarPlugin'
  | 'autoEmbedPlugin'
  | 'debug'

export interface EditorSettings {
  options: Record<OptionName, boolean>
  inlineImageUploadCollection: string
  placeholderText: string
}

export interface EditorConfig {
  settings: EditorSettings
  lexical: LexicalEditorConfig
}

export interface ServerEditorConfig {
  settings: EditorSettings
  lexical: LexicalEditorConfig
}

export interface ClientEditorConfig {
  admin?: LexicalFieldAdminProps
  settings: EditorSettings
  lexical: LexicalEditorConfig
}
