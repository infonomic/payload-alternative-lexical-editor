import { type CollectionConfig } from 'payload'
import { lexicalRichTextMinimal } from '@/_payload/fields/richtext-minimal'
import { isAdmin, isAdminOrEditor, publishedOnly } from '@/_payload/access'
import { slugField } from '@/_payload/fields/slug'

export const Minimal: CollectionConfig = {
  slug: 'minimal',
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
    singular: 'Minimal',
    plural: 'Minimal',
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
    lexicalRichTextMinimal({
      name: 'richText',
      label: 'RichText',
      required: true,
    }),
    slugField(),
  ],
}
