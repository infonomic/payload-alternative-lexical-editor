import type { Field, FormState } from 'payload'

import type { Position } from '../../nodes/inline-image-node/types'

export interface InlineImageData {
  id?: string
  altText?: string
  position?: Position
  size?: 'small' | 'medium' | 'auto'
  showCaption?: boolean
}

export interface InlineImageDrawerProps {
  isOpen: boolean
  drawerSlug: string
  onClose: () => void
  onSubmit: (data: InlineImageData) => void
  data?: InlineImageData
}
