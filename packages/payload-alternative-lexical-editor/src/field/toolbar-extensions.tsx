'use client'

import type * as React from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ToolbarExtensionItem = {
  id: string
  order?: number
  node: React.ReactNode
}

type ToolbarExtensionsContextType = {
  items: ToolbarExtensionItem[]
  register: (item: ToolbarExtensionItem) => () => void
}

const ToolbarExtensionsContext = createContext<ToolbarExtensionsContextType | null>(null)

export function ToolbarExtensionsProvider({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const [itemsById, setItemsById] = useState<Map<string, ToolbarExtensionItem>>(() => new Map())

  const register = useCallback((item: ToolbarExtensionItem) => {
    setItemsById((prev) => {
      const next = new Map(prev)
      next.set(item.id, item)
      return next
    })

    return () => {
      setItemsById((prev) => {
        if (!prev.has(item.id)) return prev
        const next = new Map(prev)
        next.delete(item.id)
        return next
      })
    }
  }, [])

  const items = useMemo(() => Array.from(itemsById.values()), [itemsById])

  const value = useMemo(() => ({ items, register }), [items, register])

  return (
    <ToolbarExtensionsContext.Provider value={value}>{children}</ToolbarExtensionsContext.Provider>
  )
}

export function useToolbarExtensions(): ToolbarExtensionsContextType {
  const context = useContext(ToolbarExtensionsContext)
  if (context == null) {
    throw new Error('useToolbarExtensions must be used within a ToolbarExtensionsProvider')
  }
  return context
}
