import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { CartLineItem } from '../components/cart/CartLineItem'
import { OrderTotals } from '../components/cart/OrderTotals'
import { Button, ButtonLink } from '../components/ui/Button'
import { Alert, EmptyState, SectionHeading, Skeleton } from '../components/ui/misc'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function CartPage() {
  const { lines, subtotal, itemCount, hasIssues, clear, ready } = useCart()
  const [confirmClear, setConfirmClear] = useState(false)
  usePageMeta('Carrinho de compras')

  if (!ready) {
    return (
      <div className="container-page space-y-4 py-12">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Carrinho de compras</h1>
        <div className="card">
          <EmptyState
            icon={<ShoppingBag className="size-7" aria-hidden />}
            title="O seu carrinho está vazio"
            description="Ainda não adicionou nenhum produto. Explore a loja e encontre os seus doces favoritos."
            action={<ButtonLink to="/loja">Explorar produtos</ButtonLink>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Link to="/loja" className="inline-flex items-center gap-1.5 text-sm font-medium text-cocoa-700 hover:text-cocoa-900">
        <ArrowLeft className="size-4" aria-hidden /> Continuar a comprar
      </Link>
      <SectionHeading
        as="h1"
        className="mt-4"
        title="Carrinho de compras"
        description={`${itemCount} ${itemCount === 1 ? 'artigo' : 'artigos'} · Reveja os produtos antes de finalizar.`}
      />

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card px-4 sm:px-6">
          {hasIssues && (
            <Alert tone="error" className="mt-5">
              Alguns produtos já não estão disponíveis. Remova-os para poder finalizar a encomenda.
            </Alert>
          )}
          <ul className="divide-y divide-cocoa-900/10">
            {lines.map((line) => (
              <CartLineItem key={line.key} line={line} />
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cocoa-900/10 py-4">
            {confirmClear ? (
              <div className="flex flex-wrap items-center gap-2 text-sm" role="alert">
                <span className="font-medium">Remover todos os produtos?</span>
                <Button size="sm" variant="dark" onClick={clear}>
                  Sim, limpar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(true)} className="text-brand-700">
                Limpar carrinho
              </Button>
            )}
          </div>
        </div>

        <aside className="card p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Resumo">
          <h2 className="text-xl font-semibold">Resumo</h2>
          <div className="mt-5">
            <OrderTotals subtotal={subtotal} />
          </div>
          <ButtonLink
            to="/encomenda"
            size="lg"
            className="mt-6 w-full"
            aria-disabled={hasIssues || undefined}
            onClick={(e) => hasIssues && e.preventDefault()}
          >
            Finalizar encomenda
          </ButtonLink>
          <ButtonLink to="/loja" variant="outline" className="mt-3 w-full">
            Continuar a comprar
          </ButtonLink>
          <p className="mt-5 text-xs leading-relaxed text-cocoa-500">
            O pedido é enviado à loja pelo WhatsApp e confirmado pessoalmente. O site não processa pagamentos.
          </p>
        </aside>
      </div>
    </div>
  )
}
