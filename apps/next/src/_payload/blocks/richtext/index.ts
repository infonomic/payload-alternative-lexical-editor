import type { Block } from 'payload'

import { blockFields } from '../../fields/block'

export const RichTextBlock: Block = {
  slug: 'richTextBlock',
  labels: {
    singular: 'Rich Text',
    plural: 'Rich Text'
  },
  interfaceName: 'RichTextBlock',
  fields: [
    blockFields({
      name: 'richTextBlockFields',
      fields: [
        {
          name: 'richText',
          type: 'richText',
          label: 'Rich Text',
          localized: true,
          required: false
        },
        {
          name: 'constrainedWidth',
          type: 'checkbox',
          label: 'Constrained Width',
          defaultValue: true,
          admin: {
            className: 'rich-text-constrained-width',
            description:
              "Constrain the width of the rich text block. Normally rich text will be constrained to 920px. Only turn this setting off if you're sure you want full-width unconstrained text."
          }
        }
      ]
    })
  ]
}
