import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

interface UIContextValue {
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const value = useMemo(
    () => ({ cartOpen, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen }),
    [cartOpen, searchOpen, menuOpen],
  )
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI deve ser usado dentro de <UIProvider>')
  return ctx
}
