import type {
  SerializedEditorState,
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedRootNode,
  SerializedTextNode,
} from 'lexical'

/**
 * createEmptyEditorState
 * @returns 
 * root: {
      // Lexical does not allow the root to have zero children.
      // Represent an "empty" document as a single empty paragraph.
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              type: 'text',
              text: '',
              format: 0,
              style: '',
              mode: 0,
              detail: 0,
              direction: 'ltr',
              indent: 0,
              version: 1,
            },
          ],
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
 */
export function createEmptyEditorState(): SerializedEditorState<SerializedLexicalNode> {
  // Lexical does not allow the root to have zero children.
  // Represent an "empty" document as a single empty paragraph.
  const emptyTextNode: SerializedTextNode = {
    type: 'text',
    text: '',
    format: 0,
    style: '',
    mode: 'normal',
    detail: 0,
    version: 1,
  }

  const emptyParagraphNode: SerializedParagraphNode = {
    type: 'paragraph',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
    direction: 'ltr',
    children: [emptyTextNode],
  }

  const rootNode: SerializedRootNode = {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [emptyParagraphNode],
  }

  return { root: rootNode }
}
