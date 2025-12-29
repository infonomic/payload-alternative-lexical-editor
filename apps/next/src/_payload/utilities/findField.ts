import type { Field } from 'payload'

/**
 * findField
 * @description Helper method to find date or text fields in a collection config
 * @param {Field[]} fields
 * @param {string} name Name of the field to find
 * @returns {Field}
 */
export function findField(fields: Field[] | undefined, name: string): Field | undefined {
  if (fields == null) {
    return undefined
  }

  let found: Field | undefined
  for (const field of fields) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        found = findField(tab.fields, name)
        if (found != null) break
      }
      // break outer loop as well (without labels)
      if (found != null) break
    }

    if (field.type === 'group' || field.type === 'collapsible' || field.type === 'row') {
      found = findField(field.fields, name)
      if (found != null) break
    }

    // @ts-expect-error TODO: limit field types to those with name properties
    if (Object.hasOwn(field, 'name') && field.name === name) {
      found = field
      break
    }
  }

  return found
}
