'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import { Button, Drawer, Form, FormSubmit, RenderFields, useTranslation } from '@payloadcms/ui'
import type { CollectionSlug, FormState } from 'payload'

import { useEditorConfig } from '../../config/editor-config-context'
import { getFields, getInitialState, validateFields } from './fields'
import type { Position, Size } from '../../nodes/inline-image-node'
import type { InlineImageData, InlineImageDrawerProps } from './types'

import './inline-image-drawer.css'

const baseClass = 'inline-image-plugin--modal'

export const InlineImageDrawer: React.FC<InlineImageDrawerProps> = ({
  isOpen = false,
  drawerSlug,
  onSubmit,
  onClose,
  data: dataFromProps,
}) => {
  const { config } = useEditorConfig()
  const { t } = useTranslation()

  const [synchronizedFormState, setSynchronizedFormState] = useState<FormState | undefined>(
    undefined
  )

  const handleOnCancel = (): void => {
    setSynchronizedFormState(undefined)
    onClose()
  }

  async function handleFormOnChange({ formState }: { formState: FormState }): Promise<FormState> {
    return new Promise((resolve, _reject) => {
      validateFields(formState)
      resolve(formState)
    })
  }

  const handleFormOnSubmit = (fields: FormState, data: Record<string, unknown>): void => {
    const { valid } = validateFields(fields)
    if (valid === true) {
      if (onSubmit != null) {
        const submitData: InlineImageData = {
          id: data.image as string,
          altText: data.altText as string,
          position: data.position as Position,
          size: data.size as Size,
          showCaption: data.showCaption as boolean,
        }
        onSubmit(submitData)
      }
      setSynchronizedFormState(undefined)
      onClose()
    }
  }

  useEffect(() => {
    if (synchronizedFormState == null && isOpen === true) {
      const formState = getInitialState(dataFromProps)
      setSynchronizedFormState(formState)
    }
  }, [synchronizedFormState, isOpen, dataFromProps])

  if (isOpen === false) {
    return null
  }

  return (
    <Drawer slug={drawerSlug} className={baseClass} title="Inline Image">
      <Form
        initialState={synchronizedFormState}
        onSubmit={handleFormOnSubmit}
        onChange={[handleFormOnChange]}
      >
        <RenderFields
          fields={getFields(config.inlineImageUploadCollection as CollectionSlug)}
          forceRender
          parentSchemaPath=""
          parentPath=""
          parentIndexPath=""
          permissions={true}
          readOnly={false}
        />
        <div
          className="inline-image-plugin--modal-actions"
          data-test-id="inline-image-model-actions"
        >
          <FormSubmit>{t('general:save')}</FormSubmit>
          <Button buttonStyle="secondary" onClick={handleOnCancel}>
            {t('general:cancel')}
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}
