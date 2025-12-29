'use client'
import * as React from 'react'
import { useEffect } from 'react'

import { formatDrawerSlug } from '@payloadcms/ui'
import { useEditDepth } from '@payloadcms/ui'
import { useModal } from '@payloadcms/ui'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister, $insertNodeToNearestRoot } from '@lexical/utils'
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
  COMMAND_PRIORITY_NORMAL
} from 'lexical'

import { AdmonitionDrawer } from './admonition-drawer'
import { useEditorConfig } from '../../config/editor-config-context'
import { $createAdmonitionNode, AdmonitionNode } from '../../nodes/admonition-node'

import type { AdmonitionData } from './types'
import type { AdmonitionAttributes } from '../../nodes/admonition-node/types'

export type InsertAdmonitionPayload = Readonly<AdmonitionAttributes>

export const OPEN_ADMONITION_MODAL_COMMAND: LexicalCommand<null> = createCommand(
  'OPEN_ADMONITION_MODAL_COMMAND'
)

export const INSERT_ADMONITION_COMMAND: LexicalCommand<AdmonitionAttributes> = createCommand(
  'INSERT_ADMONITION_COMMAND'
)

export function AdmonitionPlugin(): React.JSX.Element {
  const [editor] = useLexicalComposerContext()
  const { uuid } = useEditorConfig()
  const editDepth = useEditDepth()

  const {
    toggleModal = () => {
      console.error('Error: useModal() from Payload did not work correctly')
    },
    closeModal,
    isModalOpen
  } = useModal()

  const admonitionDrawerSlug = formatDrawerSlug({
    slug: `lexicalRichText-admonition-insert-${uuid}`,
    depth: editDepth
  })

  useEffect(() => {
    if (!editor.hasNodes([AdmonitionNode])) {
      throw new Error('AdmonitionPlugin: AdmonitionNode not registered on editor')
    }

    return mergeRegister(
      // TODO: possibly register this command with insert and edit options?
      editor.registerCommand<null>(
        OPEN_ADMONITION_MODAL_COMMAND,
        () => {
          if (admonitionDrawerSlug != null) {
            toggleModal(admonitionDrawerSlug)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_NORMAL
      ),

      editor.registerCommand<InsertAdmonitionPayload>(
        INSERT_ADMONITION_COMMAND,
        (payload: AdmonitionAttributes) => {
          // return true
          const selection = $getSelection()

          if (!$isRangeSelection(selection)) {
            return false
          }

          const focusNode = selection.focus.getNode()

          if (focusNode !== null) {
            const admonitionNode = $createAdmonitionNode(payload)
            $insertNodeToNearestRoot(admonitionNode)
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor, admonitionDrawerSlug, toggleModal])

  const handleInsertAdmonition = ({ admonitionType, title }: AdmonitionData): void => {
    if (title != null && admonitionType != null) {
      const admonitionPayload: AdmonitionAttributes = {
        admonitionType,
        title
      }

      editor.dispatchCommand(INSERT_ADMONITION_COMMAND, admonitionPayload)
    } else {
      console.error('Error: missing title or type for admonition.')
    }
    closeModal(admonitionDrawerSlug)
  }

  return (
    <AdmonitionDrawer
      isOpen={isModalOpen(admonitionDrawerSlug)}
      drawerSlug={admonitionDrawerSlug}
      data={{ title: '', admonitionType: undefined }}
      onSubmit={handleInsertAdmonition}
    />
  )
}
