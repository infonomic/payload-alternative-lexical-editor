/**
 * In this afterRead hook we process complete document
 * relationships only for specific node types - in this case the
 * full media / upload / image document for the inline-image plugin
 * so that the frontend serializer has everything it needs to
 * create responsive images via 'sizes' that are defined in
 * our media upload collection.
 */

import type { FieldHookArgs, GeneratedTypes, PayloadRequest, RequestContext } from 'payload'

import { loadRelated } from './utils/load-related'

import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import type { Payload } from 'payload'
import type { SerializedInlineImageNode } from './nodes/inline-image-node'

// See https://github.com/payloadcms/payload/pull/11316

// type LexicalAfterReadPopulateMediaFieldHook = (
//   args: Omit<FieldHookArgs<any, SerializedEditorState | null, any>, 'blockData' | 'siblingFields'>
// ) => Promise<SerializedEditorState | null> | SerializedEditorState | null

type TypeWithID = { id: string };

type AfterReadRichTextHookArgs<TData extends TypeWithID = any, TValue = any, TSiblingData = any> = {
  data?: TData;
  value?: TValue;
  siblingData: TSiblingData;
  context: RequestContext;
  req: PayloadRequest;
};

type BaseRichTextHookArgs<TData extends TypeWithID = any, TValue = any, TSiblingData = any> = {
  data?: TData;
  value?: TValue;
  siblingData: TSiblingData;
  context: RequestContext;
  req: PayloadRequest;
};

type AfterReadRichTextHook<
  TData extends TypeWithID = any,
  TValue = any,
  TSiblingData = any,
> = (
  args: AfterReadRichTextHookArgs<TData, TValue, TSiblingData> &
    BaseRichTextHookArgs<TData, TValue, TSiblingData>,
) => Promise<TValue> | TValue;

export const populateLexicalMedia: AfterReadRichTextHook<any, SerializedEditorState | null, any> = async ({
  value,
  req,
}): Promise<SerializedEditorState | null> => {
  const { payload, locale } = req

  if (value == null) {
    return null
  }

  if (value?.root?.children != null) {
    for (const childNode of value.root.children) {
      await traverseLexicalField(payload, childNode, locale ?? '')
    }
  }
  return value
}

export async function traverseLexicalField(
  payload: Payload,
  node: SerializedLexicalNode & { children?: SerializedLexicalNode[] },
  locale: string
): Promise<void> {
  if (node.type === 'inline-image') {
    const { doc } = node as SerializedInlineImageNode
    if (doc?.value != null && doc?.relationTo != null) {
      const relation = await loadRelated(
        payload,
        doc.value,
        doc.relationTo as keyof GeneratedTypes['collections'],
        1,
        locale
      )
      if (relation != null) {
        ;(node as SerializedInlineImageNode).doc.data = relation as any
      }
    }
  }

  // Run for its children
  if (node.children != null && node.children.length > 0) {
    for (const childNode of node.children) {
      await traverseLexicalField(payload, childNode, locale)
    }
  }
}
