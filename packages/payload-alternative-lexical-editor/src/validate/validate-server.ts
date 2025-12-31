import type { SerializedEditorState } from 'lexical'
import type { RichTextField, Validate } from 'payload'

import { hasText } from './hasText'

// https://github.com/payloadcms/payload/pull/6435
export const validateFn: Validate<SerializedEditorState, unknown, unknown, RichTextField> = async (
  value,
  options
) => {
  const {
    req: { t },
    required,
  } = options

  if (required && hasText(value) === false) {
    return t('validation:required')
  }

  return true
}
