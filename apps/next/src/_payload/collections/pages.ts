import { type CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOnly } from '@/_payload/access'
import { editor } from '@/_payload/fields/editor'
import { publishedOn } from '@/_payload/fields/published-on'
import { PhotoBlock } from '@/_payload/blocks/photo'
import { RichTextBlock } from '@/_payload/blocks/richtext'
import { slugField } from '@/_payload/fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    enableRichTextLink: true,
    defaultColumns: ['title', 'publishedOn', '_status'],
    useAsTitle: 'title',
    group: 'Content',
    preview: (doc, { locale }) => {
      if (doc?.slug != null) {
        return `http://localhost:3000/${doc.slug as string}?locale=${locale}`
      }
      return null
    },
  },
  defaultSort: '-publishedOn',
  versions: {
    drafts: true,
    maxPerDoc: 5
  },
  labels: {
    singular: 'Page',
    plural: 'Pages'
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOnly,
    readVersions: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true
            },
            {
              name: 'sub',
              type: 'textarea',
              localized: true,
              admin: {
                description: "Optionally enter a sub-title, sub-tag, or 'lead' for this page."
              }
            },

          ]
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'blocks',
              blocks: [
                RichTextBlock,
                PhotoBlock,
              ],
              required: true
            }
          ]
        }
      ]
    },
    slugField(),
    publishedOn(),
    editor()
  ]
}
