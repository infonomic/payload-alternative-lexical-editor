import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { lexicalEditor } from '@infonomic/payload-alternative-lexical-editor'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { en } from 'payload/i18n/en'
import sharp from 'sharp'

import { collectionAliases } from '@/infonomic.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

import { Compact } from '@/_payload/collections/compact'
import { Debug } from '@/_payload/collections/debug'
import { Full } from '@/_payload/collections/full'
import { Media } from '@/_payload/collections/media'
import { Minimal } from '@/_payload/collections/minimal'
import { Pages } from '@/_payload/collections/pages'
import { Users } from '@/_payload/collections/users'

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    autoLogin: {
      email: 'dev@payloadcms.com',
      password: 'test',
      prefillOnly: true,
    },
  },
  // @ts-expect-error: return type for editorConfig is different
  editor: lexicalEditor({ collectionAliases }),
  collections: [Pages, Full, Minimal, Compact, Debug, Media, Users],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // db: postgresAdapter({
  //   pool: {
  //     connectionString: process.env.POSTGRES_URI || ''
  //   }
  // }),
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),

  /**
   * Payload can now accept specific translations from 'payload/i18n/en'
   * This is completely optional and will default to English if not provided
   */
  i18n: {
    supportedLanguages: { en },
  },

  async onInit(payload) {
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'dev@payloadcms.com',
          password: 'test',
          roles: ['admin'],
        },
      })
    }
  },
  // Sharp is now an optional dependency -
  // if you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.

  // This is temporary - we may make an adapter pattern
  // for this before reaching 3.0 stable
  sharp,
})
