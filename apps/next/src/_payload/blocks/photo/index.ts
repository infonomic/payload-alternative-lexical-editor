import type { Block } from 'payload'

import { lexicalEditor } from '../../adapters/richtext-lexical'
import { blockFields } from '../../fields/block'

export const PhotoBlock: Block = {
  slug: 'photoBlock',
  labels: {
    singular: 'Photo',
    plural: 'Photos'
  },
  interfaceName: 'PhotoBlock',
  fields: [
    blockFields({
      name: 'photoBlockFields',
      fields: [
        {
          name: 'position',
          type: 'select',
          defaultValue: 'default',
          options: [
            {
              label: 'Default',
              value: 'default'
            },
            {
              label: 'Wide',
              value: 'wide'
            },
            {
              label: 'Full Width',
              value: 'full_width'
            }
          ]
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true
        },
        {
          name: 'useSourcePhotoCaption',
          label: 'Use Source Photo Caption',
          type: 'checkbox',
          defaultValue: true
        },
        {
          name: 'caption',
          type: 'richText',
          label: 'Caption',
          localized: true,
          required: true,
          admin: {
            condition: (_, siblingData) => siblingData.useSourcePhotoCaption === false
          },
          editor: lexicalEditor({
            settings: (config) => {
              config.options.textAlignment = false
              config.options.tablePlugin = false
              config.options.horizontalRulePlugin = false
              config.options.inlineImagePlugin = false
              config.options.autoEmbedPlugin = false
              config.options.floatingTextFormatToolbarPlugin = false
              config.options.floatingLinkEditorPlugin = true
              config.options.checkListPlugin = false
              config.options.listPlugin = false
              config.options.autoEmbedPlugin = false
              config.options.admonitionPlugin = false
              config.options.layoutPlugin = false
              config.options.codeHighlightPlugin = false
              config.options.layoutPlugin = false
              config.options.debug = false
              return config
            }
          })
        }
      ]
    })
  ]
}
