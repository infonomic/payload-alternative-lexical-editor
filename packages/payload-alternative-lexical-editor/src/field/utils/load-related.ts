import type { Payload, RequestContext } from 'payload'

export async function loadRelated(
  payload: Payload,
  value: string,
  relationTo: string,
  depth: number,
  locale: any
): Promise<any | null> {
  try {
    const relatedDoc = await payload.findByID({
      collection: relationTo,
      id: value,
      depth,
      locale,
    })
    return relatedDoc
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function loadRelatedWithContext(
  payload: Payload,
  context: RequestContext,
  contextKey: string,
  value: string,
  relationTo: string,
  depth: number,
  locale: any
): Promise<any | null> {
  try {
    if (context[contextKey] == null) {
      context[contextKey] = [value]
    } else {
      // @ts-expect-error
      if (context[contextKey].includes(value)) {
        return null
      } else {
        // @ts-expect-error
        context[contextKey].push(value)
      }
    }

    const relatedDoc = await payload.findByID({
      context,
      collection: relationTo,
      id: value,
      depth,
      locale,
    })
    return relatedDoc
  } catch (error) {
    console.error(error)
    return null
  }
}
