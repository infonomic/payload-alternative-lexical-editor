import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor } from '../access'
import { validateFilename } from '../validation/validate-filename'
import { MediaCollectionDescription } from './components/media-collection-description'

const getAdminThumbnail = ({ doc }: any): string | null => {
  const mimeType = doc.mimeType as string
  if (mimeType === 'image/svg+xml') {
    return doc.url
  } else if (mimeType.includes('video')) {
    return 'https://your-link-to-a-video-icon.png'
  } else if (mimeType.includes('audio')) {
    return 'https://your-link-to-an-audio-icon.png'
  } else if (doc?.sizes?.thumbnail != null) {
    return doc.sizes.thumbnail.url
  } else {
    return null
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    enableRichTextLink: false,
    enableRichTextRelationship: false,
    group: 'Uploads',
    components: {
      Description:
        '/_payload/collections/components/media-collection-description#MediaCollectionDescription',
    },
  },
  access: {
    create: isAdminOrEditor,
    read: () => true,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [validateFilename],
  },
  upload: {
    staticDir: path.resolve(__dirname, '../../../uploads/media'),
    adminThumbnail: getAdminThumbnail,
    mimeTypes: ['image/*', 'audio/*', 'video/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        height: 400,
        width: 400,
        position: 'center',
      },
      {
        name: 'square',
        width: 1200,
        height: 1200,
        position: 'center',
      },
      {
        name: 'square_webp',
        width: 1200,
        height: 1200,
        position: 'center',
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'mobile',
        width: 900,
        height: 1200,
        position: 'center',
      },
      {
        name: 'mobile_webp',
        width: 900,
        height: 1200,
        position: 'center',
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'small',
        width: 900,
        // height: 600,
        position: 'center',
      },
      {
        name: 'small_webp',
        width: 900,
        // height: 600,
        position: 'center',
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'medium',
        width: 1200,
        // height: 800,
        position: 'center',
      },
      {
        name: 'medium_webp',
        width: 1200,
        // height: 800,
        position: 'center',
        formatOptions: {
          format: 'webp',
        },
      },
      {
        name: 'large',
        width: 2100,
        // height: 1400,
        position: 'center',
      },
      {
        name: 'large_webp',
        width: 2100,
        // height: 1400,
        position: 'center',
        formatOptions: {
          format: 'webp',
        },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
