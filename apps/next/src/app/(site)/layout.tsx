import cx from 'classnames'
import type React from 'react'
import './globals.scss'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

/* Our app sits here to not cause any conflicts with payload's root layout  */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html className={cx(inter.className, 'dark  scroll-smooth')} lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}

export default Layout
