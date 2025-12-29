import type { FieldHook } from 'payload'

import { findField } from './findField'

// NOTE: We could have just tested for a regex pattern of the
// input value of formatTextField to see if the first 10 characters
// match the date part of an iSO 8601 date, but.. hey ho,
// in this implementation we could do a bit more with the date
// field type or other field types.

/**
 * formatTextField
 * @description format text to slug
 * @param {string} value
 * @returns {string}
 */
const formatTextField = (value: string): string =>
  value
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

/**
 * formatDateField
 * @description Payload CMS date fields (via react-datepicker) are stored in
 * iso 8601 date format, and so we can be sure(?) that the first
 * 10 characters are yyyy-mm-dd
 * @todo What about two docs with slugs on the same day?
 * @param {string} value
 * @returns {string}
 */
const formatDateField = (value: string): string => value.substring(0, 10)

/**
 * formatSlug
 * @description format the data of the supplied field as a slug
 * @param {string} fieldName source field to use for generating slug
 * @returns {string}
 */
const formatSlug =
  (fieldName: string): FieldHook =>
  ({ operation, value, originalDoc, data, collection }) => {
    let slug: string = ''
    // If there's already a value in the slug field - for example
    // if someone has manually typed into this field then simply
    // format it according to text formatting rules.
    if (typeof value === 'string' && value.length > 0) {
      slug = formatTextField(value)
    }

    // If we're creating a new document, or the slug field is empty
    if (operation === 'create' || (typeof value === 'string' && value.length === 0)) {
      const fieldData = data?.[fieldName] ?? originalDoc?.[fieldName]

      if (fieldData != null && typeof fieldData === 'string') {
        // Find the source field in the collection for fieldName in order
        // to determine its type.
        const sourceField = findField(collection?.fields, fieldName)
        // We only allow formatting slugs from date or text fields (for now)
        if (sourceField?.type === 'date' || sourceField?.type === 'text') {
          if (sourceField?.type === 'date') {
            slug = formatDateField(fieldData)
          } else {
            slug = formatTextField(fieldData)
          }
        }
      }
    }

    // TODO - removals means that if the value ends in a special character
    // like 'my-bio-title-(PhD)' the ending parens will be converted to a dash -
    if (slug.endsWith('-')) {
      slug = slug.substring(0, slug.length - 1)
    }

    return slug
  }

export default formatSlug
