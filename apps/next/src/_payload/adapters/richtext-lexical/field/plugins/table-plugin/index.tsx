'use client'

import type * as React from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { formatDrawerSlug, useEditDepth, useModal } from '@payloadcms/ui'
import { COMMAND_PRIORITY_NORMAL, createCommand } from 'lexical'

import { useEditorConfig } from '../../config/editor-config-context'
import { TableDrawer } from './table-drawer'

export const OPEN_TABLE_MODAL_COMMAND = createCommand('OPEN_TABLE_MODAL_COMMAND')

export function TablePlugin(): React.JSX.Element {
  const [editor] = useLexicalComposerContext()
  const { uuid } = useEditorConfig()
  const editDepth = useEditDepth()
  const {
    toggleModal = () => {
      console.error('Error: useModal() from Payload did not work correctly')
    },
  } = useModal()

  const addTableDrawerSlug = formatDrawerSlug({
    slug: `lexicalRichText-add-table-${uuid}`,
    depth: editDepth,
  })

  editor.registerCommand<null>(
    OPEN_TABLE_MODAL_COMMAND,
    () => {
      const modalSlug = addTableDrawerSlug
      if (modalSlug != null) {
        toggleModal(modalSlug)
        return true
      }
      return false
    },
    COMMAND_PRIORITY_NORMAL
  )

  return <TableDrawer drawerSlug={addTableDrawerSlug} />
}
