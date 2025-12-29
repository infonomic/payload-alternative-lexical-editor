import type { Access } from 'payload'

import type { User } from '@/payload-types'

export const isAdminOrEditor: Access<User> = ({ req: { user } }) => {
  // Return true or false based on if the user has an admin or editor role
  return Boolean(user?.roles?.includes('admin') || user?.roles?.includes('editor'))
}
