'use client'

/**
 * Portions copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from https://github.com/payloadcms/payload/tree/main/packages/richtext-lexical
 */

import type * as React from 'react'
import { lazy, Suspense } from 'react'

import { ShimmerEffect } from '@payloadcms/ui'

import type { LexicalRichTextFieldProps } from '../types'

const RichTextEditor = lazy(() =>
  import('./field-component').then((module) => ({ default: module.RichText }))
)

export function RichTextField(props: LexicalRichTextFieldProps): React.JSX.Element {
  return (
    <Suspense fallback={<ShimmerEffect height="35vh" />}>
      <RichTextEditor {...props} />
    </Suspense>
  )
}
