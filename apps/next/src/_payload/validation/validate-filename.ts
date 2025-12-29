import path from 'path'

import { ValidationError } from 'payload'
import type { CollectionBeforeValidateHook } from 'payload'

// This regex matches strings containing only alphanumeric characters,
// underscores and dashes.
const FILENAME_REGEX = /^[\w.\-]+$/

// Returns an appropriate error message for invalid filenames, and returns null
// if filename is valid.
const getFilenameError = (filename: string | null | undefined): string | null => {
  if (filename == null) {
    return 'Filename is required'
  }

  const basename = path.parse(filename).name

  if (basename.length > 70) {
    return 'Filename is too long'
  } else if (!FILENAME_REGEX.test(basename)) {
    return 'Filename contains invalid characters'
  } else {
    return null
  }
}

// Hook to validate filename for upload collection; returning a
// ValidationError pointing at field "file" causes the payload
// frontend to display an error tooltip on the file input element.
export const validateFilename: CollectionBeforeValidateHook = ({ data }) => {
  const message = getFilenameError(data?.filename)
  if (message != null) {
    throw new ValidationError({
      errors: [
        {
          path: 'file',
          message,
        },
      ],
    })
  }
}
