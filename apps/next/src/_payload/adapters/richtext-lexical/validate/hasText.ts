import type {
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedTextNode
} from 'lexical'

export function hasText(
  value: SerializedEditorState<SerializedLexicalNode> | null | undefined
): boolean {
  if (value == null) return false

  const hasChildren = !!value?.root?.children?.length

  let hasOnlyEmptyParagraph = false
  if (value?.root?.children?.length === 1) {
    if (value?.root?.children[0]?.type === 'paragraph') {
      const paragraphNode = value?.root?.children[0] as SerializedParagraphNode

      if (!paragraphNode?.children || paragraphNode?.children?.length === 0) {
        hasOnlyEmptyParagraph = true
      } else if (paragraphNode?.children?.length === 1) {
        const paragraphNodeChild = paragraphNode?.children[0]
        if (paragraphNodeChild.type === 'text') {
          if (!(paragraphNodeChild as SerializedTextNode | undefined)?.['text']?.length) {
            hasOnlyEmptyParagraph = true
          }
        }
      }
    }
  }

  if (hasChildren === false || hasOnlyEmptyParagraph === true) {
    return false
  } else {
    return true
  }
}