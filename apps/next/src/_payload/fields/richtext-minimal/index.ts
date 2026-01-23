import type { LexicalAdapter } from '@infonomic/payload-alternative-lexical-editor'
import { lexicalEditor } from '@infonomic/payload-alternative-lexical-editor'
import type { Field } from 'payload'

import { collectionAliases } from '@/infonomic.config'
import deepMerge from '../../utilities/deepMerge'

// import type { LexicalRichTextAdapter } from '../../adapters/richtext-lexical/types'

type Options = Partial<Field> & { editor?: LexicalAdapter }

type RichTextField = (options?: Options) => Field

export const lexicalRichTextMinimal: RichTextField = (options = {}) =>
  deepMerge<Field, Options>(
    {
      name: 'richText',
      label: 'RichText',
      type: 'richText',
      admin: {
        components: {
          beforeInput: ['/_payload/plugins/foo#Foo'],
        },
      },
      editor: lexicalEditor({
        collectionAliases,
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
        },
      }),
    },
    options
  )
