import { lexicalEditor } from '../adapters/richtext-lexical'
import { type CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOnly } from '@/_payload/access'
import { slugField } from '@/_payload/fields/slug'

export const Debug: CollectionConfig = {
  slug: 'debug',
  admin: {
    enableRichTextLink: true,
    defaultColumns: ['title', 'author', '_status'],
    useAsTitle: 'title',
    group: 'Content',
    preview: (doc, { locale }) => {
      if (doc?.slug != null) {
        return `http://localhost:3000/${doc.slug as string}?locale=${locale}`
      }
      return null
    },
  },
  versions: {
    drafts: true,
    maxPerDoc: 5,
  },
  labels: {
    singular: 'Debug',
    plural: 'Debug',
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOnly,
    readVersions: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'richText',
      label: 'RichText',
      type: 'richText',
      editor: lexicalEditor({
        settings: (config) => {
          config.options.debug = true
          return config
        },
      }),
    },
    slugField(),
  ],
}
