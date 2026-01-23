'use client'

/**
 * Portions copyright (c) Meta Platforms, Inc.
 * and affiliates and is based on examples found here
 * https://github.com/facebook/lexical/tree/main/packages/lexical-playground
 *  - in particular the ImagesPlugin
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type React from 'react'
import { useEffect } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_NORMAL,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  type LexicalCommand,
  type LexicalEditor,
} from 'lexical'

import {
  $createInlineImageNode,
  $isInlineImageNode,
  InlineImageNode,
} from '../../nodes/inline-image-node'
import { CAN_USE_DOM } from '../../shared/canUseDOM'
import { useInlineImageContext } from './context'
import type { InlineImageAttributes } from '../../nodes/inline-image-node/types'

export type InsertInlineImagePayload = Readonly<InlineImageAttributes>

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow ?? window).getSelection() : null

export const OPEN_INLINE_IMAGE_MODAL_COMMAND: LexicalCommand<null> = createCommand(
  'OPEN_INLINE_IMAGE_MODAL_COMMAND'
)

export const INSERT_INLINE_IMAGE_COMMAND: LexicalCommand<InlineImageAttributes> = createCommand(
  'INSERT_INLINE_IMAGE_COMMAND'
)

export function InlineImagePlugin({
  collection,
}: {
  collection: string
}): React.JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { openDrawer } = useInlineImageContext()

  useEffect(() => {
    if (!editor.hasNodes([InlineImageNode])) {
      throw new Error('InlineImagePlugin: InlineImageNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand<null>(
        OPEN_INLINE_IMAGE_MODAL_COMMAND,
        () => {
          openDrawer(undefined, (payload) => {
            editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, payload)
          })
          return true
        },
        COMMAND_PRIORITY_NORMAL
      ),

      editor.registerCommand<InsertInlineImagePayload>(
        INSERT_INLINE_IMAGE_COMMAND,
        (payload: InlineImageAttributes) => {
          const imageNode = $createInlineImageNode(payload)
          $insertNodes([imageNode])
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd()
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),

      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event)
        },
        COMMAND_PRIORITY_HIGH
      ),

      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event)
        },
        COMMAND_PRIORITY_LOW
      ),

      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor)
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  }, [editor, openDrawer])

  return null
}

const TRANSPARENT_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
let img: HTMLImageElement
if (typeof document !== 'undefined') {
  img = document?.createElement('img')
  img.src = TRANSPARENT_IMAGE
}

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection()
  if (node == null) {
    return false
  }
  const dataTransfer = event.dataTransfer
  if (dataTransfer == null) {
    return false
  }
  dataTransfer.setData('text/plain', '_')
  dataTransfer.setDragImage(img, 0, 0)
  dataTransfer.setData(
    'application/x-lexical-drag',
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: 'image',
    })
  )

  return true
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection()
  if (node == null) {
    return false
  }
  if (!canDropImage(event)) {
    event.preventDefault()
  }
  return true
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection()
  if (node == null) {
    return false
  }
  const data = getDragImageData(event)
  if (data == null) {
    return false
  }
  event.preventDefault()
  if (canDropImage(event)) {
    const range = getDragSelection(event)
    node.remove()
    const rangeSelection = $createRangeSelection()
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range)
    }
    $setSelection(rangeSelection)
    editor.dispatchCommand(INSERT_INLINE_IMAGE_COMMAND, data)
  }
  return true
}

function getImageNodeInSelection(): InlineImageNode | null {
  const selection = $getSelection()
  if (!$isNodeSelection(selection)) {
    return null
  }
  const nodes = selection.getNodes()
  const node = nodes[0]
  return $isInlineImageNode(node) ? node : null
}

function getDragImageData(event: DragEvent): null | InsertInlineImagePayload {
  const dragData = event.dataTransfer?.getData('application/x-lexical-drag')
  if (dragData == null) {
    return null
  }
  const { type, data } = JSON.parse(dragData)
  if (type !== 'image') {
    return null
  }

  return data
}

declare global {
  interface DragEvent {
    rangeOffset?: number
    rangeParent?: Node
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target
  return !!(
    target != null &&
    target instanceof HTMLElement &&
    target.closest('code, span.editor-image') == null &&
    target.parentElement?.closest('div.ContentEditable__root') != null
  )
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range: any
  const target = event.target as null | Element | Document
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView
  const domSelection = getDOMSelection(targetWindow)
  if (document.caretRangeFromPoint != null) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY)
  } else if (event.rangeParent != null && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset ?? 0)
    range = domSelection.getRangeAt(0)
  } else {
    throw Error('Cannot get the selection when dragging')
  }

  return range
}
