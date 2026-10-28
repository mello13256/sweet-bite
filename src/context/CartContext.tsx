import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { storeConfig } from '../config/store'
import { cartReducer, resolveCart, sanitizeCart, type CartLine } from '../lib/cart'
import { getVariant, isPurchasable } from '../lib/pricing'
import type { CartItem, Product } from '../types'
import { useCatalog } from './CatalogContext'
import { useToast } from './ToastContext'

const STORAGE_KEY = storeConfig.cart.storageKey

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeCart(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

interface CartContextValue {
  items: CartItem[]
  lines: CartLine[]
  /** Linhas sem problemas (disponíveis), usadas na encomenda */
  validLines: CartLine[]
  subtotal: number
  itemCount: number
  hasIssues: boolean
  /** Muda a cada adição — usado para animar o ícone do carrinho */
  pulse: number
  ready: boolean
  addItem: (product: Product, variantId: string | undefined, quantity: number) => boolean
  setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void
  removeItem: (productId: string, variantId: string | undefined) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, readStorage)
  const [pulse, setPulse] = useState(0)
  const { products, status } = useCatalog()
  const { notify } = useToast()

  // Guarda no localStorage sempre que o carrinho muda.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* armazenamento indisponível (modo privado, quota) — o carrinho funciona na sessão */
    }
  }, [items])

  // Sincroniza entre separadores abertos.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) dispatch({ type: 'replace', items: readStorage() })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addItem = useCallback(
    (product: Product, variantId: string | undefined, quantity: number) => {
      if (!isPurchasable(product, variantId)) {
        notify({ tone: 'error', title: 'Produto indisponível', description: 'Esta opção está esgotada de momento.' })
        return false
      }
      dispatch({ type: 'add', productId: product.id, variantId, quantity })
      setPulse((n) => n + 1)
      const variant = getVariant(product, variantId)
      notify({
        tone: 'success',
        title: 'Adicionado ao carrinho',
        description: `${quantity} × ${product.name}${variant ? ` · ${variant.label}` : ''}`,
        action: { label: 'Ver carrinho', to: '/carrinho' },
      })
      return true
    },
    [notify],
  )

  const setQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) =>
      dispatch({ type: 'setQuantity', productId, variantId, quantity }),
    [],
  )
  const removeItem = useCallback(
    (productId: string, variantId: string | undefined) => dispatch({ type: 'remove', productId, variantId }),
    [],
  )
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo<CartContextValue>(() => {
    const resolved = resolveCart(items, products)
    return {
      items,
      lines: resolved.lines,
      validLines: resolved.validLines,
      subtotal: resolved.subtotal,
      itemCount: resolved.itemCount,
      hasIssues: resolved.hasIssues,
      pulse,
      ready: status === 'ready',
      addItem,
      setQuantity,
      removeItem,
      clear,
    }
  }, [items, products, status, pulse, addItem, setQuantity, removeItem, clear])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de <CartProvider>')
  return ctx
}
