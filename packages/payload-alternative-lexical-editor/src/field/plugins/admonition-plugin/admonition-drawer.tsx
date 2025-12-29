'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import {
  Button,
  Drawer,
  documentDrawerBaseClass,
  Form,
  FormSubmit,
  RenderFields,
  useModal,
  useTranslation,
} from '@payloadcms/ui'
import type { FormState } from 'payload'
import { v4 as uuid } from 'uuid'

import { getFields, getInitialState, validateFields } from './fields'
import type { AdmonitionType } from '../../nodes/admonition-node/types'
import type { AdmonitionDrawerProps } from './types'

import './admonition-drawer.css'

export function AdmonitionDrawer({
  isOpen = false,
  drawerSlug,
  onSubmit,
  data: dataFromProps,
}: AdmonitionDrawerProps): React.ReactNode {
  const { t } = useTranslation()
  const { closeModal } = useModal()

  const [synchronizedFormState, setSynchronizedFormState] = useState<FormState | undefined>(
    undefined
  )

  const handleOnCancel = (): void => {
    closeModal(drawerSlug)
  }

  async function handleFormOnChange({ formState }: { formState: FormState }): Promise<FormState> {
    return new Promise((resolve, _reject) => {
      validateFields(formState)
      resolve(formState)
    })
  }

  const handleFormOnSubmit = (fields: FormState, data: Record<string, unknown>): void => {
    const { valid } = validateFields(fields)
    if (valid === true)
      if (onSubmit != null) {
        onSubmit({
          admonitionType: data.admonitionType as AdmonitionType,
          title: data.title as string,
        })
        setSynchronizedFormState(undefined)
        closeModal(drawerSlug)
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
    <Drawer
      slug={drawerSlug}
      key={drawerSlug}
      className={documentDrawerBaseClass}
      title="Admonition"
    >
      <Form
        initialState={synchronizedFormState}
        onChange={[handleFormOnChange]}
        onSubmit={handleFormOnSubmit}
        uuid={uuid()}
        isDocumentForm={false}
      >
        <RenderFields
          fields={getFields()}
          forceRender
          readOnly={false}
          parentSchemaPath=""
          parentPath=""
          parentIndexPath=""
          permissions={true}
        />
        <div className="link-plugin--modal-actions" data-test-id="link-plugin-model-actions">
          <FormSubmit>{t('general:save')}</FormSubmit>
          <Button buttonStyle="secondary" onClick={handleOnCancel}>
            {t('general:cancel')}
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}
