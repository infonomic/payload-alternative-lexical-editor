import type { Field } from 'payload'

import deepMerge from '../../utilities/deepMerge'
import { User } from '@/payload-types'

type Editor = (overrides?: Partial<Field>) => Field

export const editor: Editor = (overrides = {}) =>
  deepMerge<Field, Partial<Field>>(
    {
      name: 'editor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ locale, user }: { locale: string; user: User }) => {
        return user.id
      },
      admin: {
        position: 'sidebar'
      }
    },
    overrides
  )
