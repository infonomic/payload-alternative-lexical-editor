'use client'

import type React from 'react'

export function MediaCollectionDescription(): React.JSX.Element {
  return (
    <div style={{ paddingRight: '12px' }}>
      <div style={{ lineHeight: '1.5rem', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
        Upload a media file to be used in a layout or as an inline image.
      </div>
      <div style={{ color: '#c72051', maxWidth: '768px', lineHeight: '1.3rem' }}>
        Note that uploaded media should ideally have a minimum width and height of 2100px in both
        dimensions. Uploaded media filenames may only contain alphanumeric characters and must not
        contain any spaces or special characters.
      </div>
    </div>
  )
}
