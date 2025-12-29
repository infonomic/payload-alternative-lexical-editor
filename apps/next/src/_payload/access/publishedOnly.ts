import type { Access } from 'payload'

import type { User } from '@/payload-types'

export const publishedOnly: Access<User> = ({ req: { user } }) => {
  // Any authenticated user can read.
  if (user != null) {
    return true
  }

  // Otherwise - return query constraint
  return {
    _status: {
      equals: 'published'
    }
  }
}
