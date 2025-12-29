import type { GeneratedTypes, Payload, RequestContext } from 'payload'

export async function loadRelated<T extends keyof GeneratedTypes['collections']>(
  payload: Payload,
  value: string,
  relationTo: T,
  depth: number,
  locale: any
): Promise<GeneratedTypes['collections'][T] | null> {
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

export async function loadRelatedWithContext<T extends keyof GeneratedTypes['collections']>(
  payload: Payload,
  context: RequestContext,
  contextKey: string,
  value: string,
  relationTo: T,
  depth: number,
  locale: any
): Promise<GeneratedTypes['collections'][T] | null> {
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
