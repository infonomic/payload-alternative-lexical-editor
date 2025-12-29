import type { Field } from 'payload'

import deepMerge from '../../utilities/deepMerge'

type PublishedOn = (overrides?: Partial<Field>) => Field

export const publishedOn: PublishedOn = (overrides = {}) =>
  deepMerge<Field, Partial<Field>>(
    {
      name: 'publishedOn',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date(),
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
    overrides
  )
