'use client'

import type * as React from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { formatDrawerSlug, useConfig, useEditDepth, useModal } from '@payloadcms/ui'
import { requests } from '@payloadcms/ui/utilities/api'

import { useEditorConfig } from '../../config/editor-config-context'
import { InlineImageDrawer } from './inline-image-drawer'
import { getPreferredSize } from './utils'
import type { InlineImageAttributes } from '../../nodes/inline-image-node/types'
import type { InlineImageData } from './types'

type InlineImageContextType = {
  openDrawer: (data?: InlineImageData, onSave?: (data: InlineImageAttributes) => void) => void
}

const Context = createContext<InlineImageContextType | null>(null)

export const InlineImageContextProvider = ({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element => {
  const {
    config: { inlineImageUploadCollection },
    uuid,
  } = useEditorConfig()
  const {
    config: {
      serverURL,
      routes: { api },
    },
  } = useConfig()
  const { toggleModal, closeModal, isModalOpen } = useModal()
  const editDepth = useEditDepth()
  const [data, setData] = useState<InlineImageData | undefined>(undefined)
  const [onSave, setOnSave] = useState<((data: InlineImageAttributes) => void) | undefined>(
    undefined
  )

  const drawerSlug = formatDrawerSlug({
    slug: `lexical-inline-image-drawer-${uuid}`,
    depth: editDepth,
  })

  const openDrawer = useCallback(
    (initialData?: InlineImageData, handleSave?: (data: InlineImageAttributes) => void) => {
      setData(initialData)
      setOnSave(() => handleSave)
      toggleModal(drawerSlug)
    },
    [drawerSlug, toggleModal]
  )

  const handleClose = useCallback(() => {
    closeModal(drawerSlug)
    setData(undefined)
    setOnSave(undefined)
  }, [closeModal, drawerSlug])

  const handleSubmit = useCallback(
    async (submittedData: InlineImageData) => {
      if (onSave && submittedData?.id != null) {
        try {
          const collection = inlineImageUploadCollection
          const url = `${serverURL}${api}/${collection}/${submittedData.id}`
          const response = await requests.get(url)
          if (response.ok) {
            const doc = await response.json()
            const editorPreviewSize = submittedData?.position === 'default' ? 'medium' : 'small'
            const imageSource = getPreferredSize(editorPreviewSize, doc)
            if (imageSource != null) {
              const imagePayload: InlineImageAttributes = {
                id: submittedData.id,
                collection: collection as string,
                src: imageSource.url,
                altText: submittedData?.altText,
                position: submittedData?.position,
                size: submittedData?.size,
                showCaption: submittedData?.showCaption,
              }

              if (imageSource.width != null) {
                imagePayload.width = imageSource.width
              }
              if (imageSource.height != null) {
                imagePayload.height = imageSource.height
              }

              onSave(imagePayload)
            } else {
              console.error(
                'Error: unable to find image source from document in InlineImageContextProvider.'
              )
            }
          } else {
            console.error(
              'Error: Response not ok trying load existing image in InlineImageContextProvider'
            )
          }
        } catch (error) {
          console.error('Error: trying load existing image in InlineImageContextProvider', error)
        }
      }
      handleClose()
    },
    [api, handleClose, inlineImageUploadCollection, onSave, serverURL]
  )

  const value = useMemo(() => ({ openDrawer }), [openDrawer])

  return (
    <Context.Provider value={value}>
      {children}
      <InlineImageDrawer
        isOpen={isModalOpen(drawerSlug)}
        drawerSlug={drawerSlug}
        data={data}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Context.Provider>
  )
}

export const useInlineImageContext = (): InlineImageContextType => {
  const context = useContext(Context)
  if (context == null) {
    throw new Error('useInlineImageContext must be used within an InlineImageContextProvider')
  }
  return context
}
