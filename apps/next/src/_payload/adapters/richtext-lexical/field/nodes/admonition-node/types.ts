import type {
  LexicalEditor,
  NodeKey,
  SerializedEditor,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

export type AdmonitionType = 'note' | 'tip' | 'warning' | 'danger'

export interface AdmonitionAttributes {
  admonitionType: AdmonitionType
  title: string
  content?: LexicalEditor
  key?: NodeKey
}

export type SerializedAdmonitionNode = Spread<
  {
    admonitionType: AdmonitionType
    title: string
    content: SerializedEditor
  },
  SerializedLexicalNode
>
