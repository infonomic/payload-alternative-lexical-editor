import { type AdmonitionType } from '../../nodes/admonition-node/types'

export interface AdmonitionData {
  admonitionType: AdmonitionType
  title: string
}

export interface AdmonitionDrawerProps {
  isOpen: boolean
  drawerSlug: string
  onSubmit: (data: AdmonitionData) => void
  data: {
    admonitionType?: AdmonitionType
    title?: string
  }
}
