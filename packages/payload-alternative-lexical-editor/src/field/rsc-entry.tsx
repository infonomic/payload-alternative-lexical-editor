/**
 * Portions copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from https://github.com/payloadcms/payload/tree/main/packages/richtext-lexical
 */

import type React from 'react'

import { renderField } from '@payloadcms/ui/forms/renderField'
import type { SerializedLexicalNode } from 'lexical'
import type {
  ClientComponentProps,
  FieldPaths,
  RichTextFieldClient,
  RichTextField as RichTextFieldType,
  ServerComponentProps,
} from 'payload'

import { buildInitialState } from './build-initial-state'
import { EditorField } from './editor-field'
import type { EditorFieldProps, LexicalFieldAdminProps } from '../types.js'
import type { ServerEditorConfig } from './config/types.js'

export const RscEntryLexicalField: React.FC<
  {
    admin: LexicalFieldAdminProps
    editorConfig: ServerEditorConfig
  } & ClientComponentProps &
    Pick<FieldPaths, 'path'> &
    ServerComponentProps
> = async (args) => {
  const field: RichTextFieldType = args.field as RichTextFieldType
  const path = args.path ?? (args.clientField as RichTextFieldClient).name
  const schemaPath = args.schemaPath ?? path

  if (!(args?.clientField as RichTextFieldClient)?.name) {
    throw new Error('Initialized lexical RSC field without a field name')
  }

  let initialLexicalFormState = {}
  if (args.siblingData?.[field.name]?.root?.children?.length) {
    initialLexicalFormState = await buildInitialState({
      context: {
        id: args.id,
        clientFieldSchemaMap: args.clientFieldSchemaMap,
        collectionSlug: args.collectionSlug,
        documentData: args.data,
        field,
        fieldSchemaMap: args.fieldSchemaMap,
        lexicalFieldSchemaPath: schemaPath,
        operation: args.operation,
        permissions: args.permissions,
        preferences: args.preferences,
        renderFieldFn: renderField,
        req: args.req,
      },
      nodeData: args.siblingData?.[field.name]?.root?.children as SerializedLexicalNode[],
    })
  }

  const admin: LexicalFieldAdminProps = {}

  if (args.admin?.hideGutter) {
    admin.hideGutter = true
  }

  const props: EditorFieldProps = {
    field: args.clientField as RichTextFieldClient,
    forceRender: args.forceRender,
    initialLexicalFormState,
    editorConfig: args.editorConfig,
    path,
    permissions: args.permissions,
    readOnly: args.readOnly,
    renderedBlocks: args.renderedBlocks,
    schemaPath,
  }
  if (Object.keys(admin).length) {
    props.admin = admin
  }

  for (const key in props) {
    if (props[key as keyof EditorFieldProps] === undefined) {
      delete props[key as keyof EditorFieldProps]
    }
  }

  return <EditorField {...props} />
}
