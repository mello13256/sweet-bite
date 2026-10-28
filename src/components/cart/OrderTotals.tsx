import { formatPrice } from '../../lib/money'
import type { DeliveryMethod } from '../../types'

interface OrderTotalsProps {
  subtotal: number
  /** undefined = método ainda não escolhido; null = a combinar */
  deliveryFee?: number | null
  method?: DeliveryMethod
}

export function OrderTotals({ subtotal, deliveryFee, method }: OrderTotalsProps) {
  const total = subtotal + (deliveryFee ?? 0)
  return (
    <dl className="space-y-2.5 text-[15px]">
      <div className="flex justify-between">
        <dt className="text-cocoa-700">Subtotal</dt>
        <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-cocoa-700">{method === 'levantamento' ? 'Levantamento' : 'Entrega'}</dt>
        <dd className="text-right font-medium tabular-nums">
          {method === undefined
            ? 'Escolhida no passo seguinte'
            : deliveryFee === null
              ? 'A combinar'
              : deliveryFee === 0
                ? 'Sem custo'
                : formatPrice(deliveryFee ?? 0)}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-cocoa-900/10 pt-3">
        <dt className="font-semibold">Total{deliveryFee === null ? ' (sem entrega)' : ''}</dt>
        <dd className="text-2xl font-bold tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  )
}
