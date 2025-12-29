import { lexicalRichTextCompact } from '../fields/richtext-compact'
import { type CollectionConfig } from 'payload'
import { isAdmin, isAdminOrEditor, publishedOnly } from '@/_payload/access'
import { slugField } from '@/_payload/fields/slug'

export const Compact: CollectionConfig = {
  slug: 'compact',
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
    singular: 'Compact',
    plural: 'Compact',
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
    lexicalRichTextCompact({
      name: 'richText',
      label: 'RichText',
      required: true,
    }),
    slugField(),
  ],
}
