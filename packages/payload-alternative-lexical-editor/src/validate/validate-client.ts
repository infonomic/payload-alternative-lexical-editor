import type { SerializedEditorState, SerializedParagraphNode } from 'lexical'
import type { Validate } from 'payload'

export const richTextValidate: Validate<
  SerializedEditorState,
  SerializedEditorState,
  unknown,
  any
> = async (value, options) => {
  const { t, required } = options

  if (required) {
    const hasChildren = value?.root?.children?.length

    const hasOnlyEmptyParagraph =
      (value?.root?.children?.length === 1 &&
        value?.root?.children[0]?.type === 'paragraph' &&
        (value?.root?.children[0] as SerializedParagraphNode)?.children?.length === 0) ||
      ((value?.root?.children[0] as SerializedParagraphNode)?.children?.length === 1 &&
        (value?.root?.children[0] as SerializedParagraphNode)?.children[0]?.type === 'text' &&
        (value?.root?.children[0] as SerializedParagraphNode)?.children[0]?.[
          'text' as keyof object
        ] === '')

    if (!hasChildren || hasOnlyEmptyParagraph) {
      return t('validation:required')
    }
  }

  return true
}
