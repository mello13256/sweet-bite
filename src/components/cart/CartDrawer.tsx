import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { useUI } from '../../context/UIContext'
import { formatPrice } from '../../lib/money'
import { Button, ButtonLink } from '../ui/Button'
import { Drawer } from '../ui/Drawer'
import { Alert, EmptyState, Skeleton } from '../ui/misc'
import { CartLineItem } from './CartLineItem'

export function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI()
  const { lines, subtotal, itemCount, hasIssues, ready } = useCart()
  const location = useLocation()
  const { dismissAll } = useToast()
  useEffect(() => setCartOpen(false), [location, setCartOpen])
  // As notificações tapariam o rodapé da gaveta.
  useEffect(() => {
    if (cartOpen) dismissAll()
  }, [cartOpen, dismissAll])

  const close = () => setCartOpen(false)
  const empty = lines.length === 0

  return (
    <Drawer
      open={cartOpen}
      onClose={close}
      title={`Carrinho${itemCount ? ` (${itemCount})` : ''}`}
      footer={
        !empty && ready ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-cocoa-700">Subtotal</span>
              <span className="text-xl font-bold tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-cocoa-500">Entrega ou levantamento escolhidos no passo seguinte.</p>
            <ButtonLink
              to="/encomenda"
              className="w-full"
              size="lg"
              aria-disabled={hasIssues || undefined}
              onClick={(e) => hasIssues && e.preventDefault()}
            >
              Finalizar encomenda
            </ButtonLink>
            <ButtonLink to="/carrinho" variant="outline" className="w-full">
              Ver carrinho
            </ButtonLink>
          </div>
        ) : undefined
      }
    >
      {!ready ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : empty ? (
        <EmptyState
          icon={<ShoppingBag className="size-7" aria-hidden />}
          title="O seu carrinho está vazio"
          description="Explore a loja e adicione os seus doces favoritos."
          action={
            <Button onClick={close} variant="primary">
              Continuar a comprar
            </Button>
          }
        />
      ) : (
        <div className="px-5">
          {hasIssues && (
            <Alert tone="error" className="mt-4">
              Há produtos esgotados no carrinho. Remova-os para continuar.
            </Alert>
          )}
          <ul className="divide-y divide-cocoa-900/10">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} compact />
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  )
}
