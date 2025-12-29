import type { FormState, OptionObject } from 'payload'
import { ClientField } from 'payload'
import { AdmonitionType } from '../../nodes/admonition-node'

export const admonitionTypeOptions: OptionObject[] = [
  {
    label: 'Note',
    value: 'note'
  },
  {
    label: 'Tip',
    value: 'tip'
  },
  {
    label: 'Warning',
    value: 'warning'
  },
  {
    label: 'Danger',
    value: 'danger'
  }
]

export const getFields = (): ClientField[] => {
  return [
    {
      name: 'title',
      localized: false,
      label: 'Title',
      required: true,
      type: 'text'
    },
    {
      name: 'admonitionType',
      localized: false,
      type: 'radio',
      label: 'Type',
      options: admonitionTypeOptions
    }
  ]
}

export function getInitialState(data: {
  admonitionType?: AdmonitionType
  title?: string
}): FormState {
  return {
    title: {
      value: data?.title,
      initialValue: data?.title,
      valid: true,
      passesCondition: true,
    },
    admonitionType: {
      value: data?.admonitionType ?? 'note',
      initialValue: data?.admonitionType ?? 'note',
      valid: true,
      passesCondition: true,
    }
  }
}

export function isTitleValid(value: string | undefined): boolean {
  return value != null && value.length > 0
}

export function validateFields(fields: FormState): { valid: boolean; fields: FormState } {
  let valid = true

  if (fields.title != null) {
    if (isTitleValid(fields.title.value as string | undefined) === false) {
      fields.title.valid = false
      valid = false
    } else {
      fields.title.valid = true
    }

  }

  return {
    valid,
    fields
  }
}
