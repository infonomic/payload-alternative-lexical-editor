import type { SerializedLexicalNode } from 'lexical'
import type {
  ClientFieldSchemaMap,
  DocumentPreferences,
  FieldSchemaMap,
  FormState,
  Operation,
  PayloadRequest,
  RichTextField,
  SanitizedFieldPermissions,
} from 'payload'

export type InitialLexicalFormState = {
  [nodeID: string]: {
    [key: string]: any
    formState?: FormState
  }
}

type Props = {
  context: {
    clientFieldSchemaMap: ClientFieldSchemaMap
    collectionSlug: string
    documentData?: any
    field: RichTextField
    fieldSchemaMap: FieldSchemaMap
    id?: number | string
    lexicalFieldSchemaPath: string
    operation: Operation
    permissions?: SanitizedFieldPermissions
    preferences: DocumentPreferences
    renderFieldFn: any
    req: PayloadRequest
  }
  initialState?: InitialLexicalFormState
  nodeData: SerializedLexicalNode[]
}

export async function buildInitialState({
  context,
  initialState: initialStateFromArgs,
  nodeData,
}: Props): Promise<InitialLexicalFormState> {
  let initialState: InitialLexicalFormState = initialStateFromArgs ?? {}
  for (const node of nodeData) {
    if ('children' in node) {
      initialState = await buildInitialState({
        context,
        initialState,
        nodeData: node.children as SerializedLexicalNode[],
      })
    }
  }
  return initialState
}
