import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CircleCheck, Copy, MessageCircle, ShoppingBag, Store, Truck } from 'lucide-react'
import { OrderTotals } from '../components/cart/OrderTotals'
import { Button, ButtonLink } from '../components/ui/Button'
import { TextAreaField, TextField } from '../components/ui/Field'
import { Alert, EmptyState, Skeleton } from '../components/ui/misc'
import { ProductImage } from '../components/ui/ProductImage'
import { storeConfig } from '../config/store'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { toOrderLines } from '../lib/cart'
import { cn } from '../lib/cn'
import { formatPrice } from '../lib/money'
import { buildOrder } from '../lib/order'
import { deliveryFeeFor } from '../lib/pricing'
import { formatPhone, todayISO, validateCustomer, validateDelivery, type FieldErrors } from '../lib/validation'
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured } from '../lib/whatsapp'
import { saveOrder, type SaveOrderResult } from '../services/orderService'
import type { CustomerDetails, DeliveryDetails, DeliveryMethod, Order } from '../types'

const DRAFT_KEY = 'sweetbite:checkout-draft'
const SENT_KEY = 'sweetbite:last-order'

const steps = ['Dados', 'Entrega', 'Resumo'] as const

interface Draft {
  customer: CustomerDetails
  delivery: DeliveryDetails
}

interface SentOrder {
  order: Order
  url: string
  message: string
  saveStatus: SaveOrderResult['status']
}

const { delivery: deliveryConfig } = storeConfig
const defaultMethod: DeliveryMethod = deliveryConfig.pickupEnabled ? 'levantamento' : 'entrega'

function readSession<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeSession(key: string, value: unknown) {
  try {
    if (value === null) window.sessionStorage.removeItem(key)
    else window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* sessionStorage indisponível */
  }
}

function initialDraft(): Draft {
  const saved = readSession<Draft>(DRAFT_KEY)
  return {
    customer: { name: '', phone: '', email: '', notes: '', ...saved?.customer },
    delivery: {
      address: '',
      postalCode: '',
      city: '',
      preferredDate: '',
      preferredTime: 'indiferente',
      ...saved?.delivery,
      method: saved?.delivery?.method ?? defaultMethod,
    },
  }
}

export default function CheckoutPage() {
  usePageMeta('Finalizar encomenda')
  const { validLines, subtotal, hasIssues, ready, clear } = useCart()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [customerErrors, setCustomerErrors] = useState<FieldErrors<CustomerDetails>>({})
  const [deliveryErrors, setDeliveryErrors] = useState<FieldErrors<DeliveryDetails>>({})
  const [attempted, setAttempted] = useState<[boolean, boolean]>([false, false])
  const [accepted, setAccepted] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<SentOrder | null>(() => readSession<SentOrder>(SENT_KEY))
  const formRef = useRef<HTMLDivElement>(null)
  const today = todayISO()
  const whatsappReady = isWhatsAppConfigured()

  useEffect(() => writeSession(DRAFT_KEY, draft), [draft])

  // Revalida em tempo real depois da primeira tentativa de avançar.
  useEffect(() => {
    if (attempted[0]) setCustomerErrors(validateCustomer(draft.customer))
    if (attempted[1]) setDeliveryErrors(validateDelivery(draft.delivery, today))
  }, [draft, attempted, today])

  const deliveryFee = deliveryFeeFor(subtotal, draft.delivery.method)
  const orderLines = useMemo(() => toOrderLines(validLines), [validLines])

  const setCustomer = (patch: Partial<CustomerDetails>) => setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } }))
  const setDelivery = (patch: Partial<DeliveryDetails>) => setDraft((d) => ({ ...d, delivery: { ...d.delivery, ...patch } }))

  const focusFirstError = () =>
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())

  const goTo = (next: number) => {
    setStep(next)
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      formRef.current?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
    })
  }

  const nextFromCustomer = () => {
    const errors = validateCustomer(draft.customer)
    setCustomerErrors(errors)
    setAttempted(([, b]) => [true, b])
    if (Object.keys(errors).length) return focusFirstError()
    goTo(1)
  }

  const nextFromDelivery = () => {
    const errors = validateDelivery(draft.delivery, today)
    setDeliveryErrors(errors)
    setAttempted(([a]) => [a, true])
    if (Object.keys(errors).length) return focusFirstError()
    goTo(2)
  }

  const send = async () => {
    if (!whatsappReady || sending) return
    if (!accepted) {
      setTermsError(true)
      return
    }
    // Validação final (o utilizador pode ter voltado atrás e alterado dados).
    const ce = validateCustomer(draft.customer)
    const de = validateDelivery(draft.delivery, today)
    if (Object.keys(ce).length) return goTo(0)
    if (Object.keys(de).length) return goTo(1)
    if (!orderLines.length || hasIssues) return

    setSending(true)
    const order = buildOrder(orderLines, draft.customer, draft.delivery)
    const message = buildOrderMessage(order)
    const url = buildWhatsAppUrl(message)
    const result = await saveOrder(order)
    if (result.status === 'failed') console.warn('[encomenda] Não foi possível guardar no Firestore:', result.error)

    const record: SentOrder = { order, url, message, saveStatus: result.status }
    setSent(record)
    writeSession(SENT_KEY, record)
    writeSession(DRAFT_KEY, { ...draft, customer: { ...draft.customer, notes: '' } })
    clear()
    setSending(false)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  if (sent) {
    return (
      <OrderSent
        sent={sent}
        onDone={() => {
          writeSession(SENT_KEY, null)
          setSent(null)
          setStep(0)
          setAccepted(false)
        }}
      />
    )
  }

  if (!ready) {
    return (
      <div className="container-page space-y-4 py-12">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!orderLines.length) {
    return (
      <div className="container-page py-12">
        <h1 className="sr-only">Finalizar encomenda</h1>
        <div className="card">
          <EmptyState
            icon={<ShoppingBag className="size-7" aria-hidden />}
            title="Não há produtos para encomendar"
            description="Adicione produtos ao carrinho para finalizar a encomenda."
            action={<ButtonLink to="/loja">Explorar produtos</ButtonLink>}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container-page pt-8 sm:pt-12">
      <Link to="/carrinho" className="inline-flex items-center gap-1.5 text-sm font-medium text-cocoa-700 hover:text-cocoa-900">
        <ArrowLeft className="size-4" aria-hidden /> Voltar ao carrinho
      </Link>
      <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Finalizar encomenda</h1>
      <p className="mt-2 max-w-xl text-cocoa-700">
        Preencha os seus dados para enviar o pedido pelo WhatsApp. A loja responde para confirmar a encomenda.
      </p>

      {hasIssues && (
        <Alert tone="error" className="mt-6 max-w-2xl" title="Há produtos esgotados no carrinho">
          <Link to="/carrinho" className="font-semibold underline">
            Volte ao carrinho
          </Link>{' '}
          e remova-os para continuar.
        </Alert>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div ref={formRef} className="card scroll-mt-24 p-5 sm:p-8">
          <Stepper current={step} onSelect={(i) => i < step && goTo(i)} />

          {step === 0 && (
            <section className="mt-8 space-y-5" aria-labelledby="passo-dados">
              <h2 id="passo-dados" tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
                1. Dados pessoais
              </h2>
              <TextField
                label="Nome completo"
                required
                autoComplete="name"
                placeholder="Ex.: Maria Silva"
                value={draft.customer.name}
                onChange={(e) => setCustomer({ name: e.target.value })}
                error={customerErrors.name}
                maxLength={80}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Telemóvel"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Ex.: 912 345 678"
                  value={draft.customer.phone}
                  onChange={(e) => setCustomer({ phone: e.target.value })}
                  error={customerErrors.phone}
                  maxLength={20}
                />
                <TextField
                  label="Email"
                  optional
                  type="email"
                  autoComplete="email"
                  placeholder="Ex.: maria@email.pt"
                  value={draft.customer.email}
                  onChange={(e) => setCustomer({ email: e.target.value })}
                  error={customerErrors.email}
                  maxLength={120}
                />
              </div>
              <TextAreaField
                label="Observações"
                optional
                placeholder="Ex.: mensagem para a caixa de oferta, alergias, preferência de horário…"
                value={draft.customer.notes}
                onChange={(e) => setCustomer({ notes: e.target.value })}
                error={customerErrors.notes}
                hint={`${draft.customer.notes.length}/500`}
                maxLength={500}
              />
              <div className="flex justify-end pt-2">
                <Button size="lg" onClick={nextFromCustomer} className="w-full sm:w-auto">
                  Continuar para a entrega <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="mt-8 space-y-6" aria-labelledby="passo-entrega">
              <h2 id="passo-entrega" tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
                2. Método de entrega
              </h2>
              <fieldset>
                <legend className="sr-only">Escolha o método</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {deliveryConfig.pickupEnabled && (
                    <MethodOption
                      value="levantamento"
                      current={draft.delivery.method}
                      onSelect={(m) => setDelivery({ method: m })}
                      icon={<Store className="size-5" aria-hidden />}
                      title="Levantamento na loja"
                      text={deliveryConfig.pickupDescription}
                      price="Sem custo"
                    />
                  )}
                  {deliveryConfig.deliveryEnabled && (
                    <MethodOption
                      value="entrega"
                      current={draft.delivery.method}
                      onSelect={(m) => setDelivery({ method: m })}
                      icon={<Truck className="size-5" aria-hidden />}
                      title="Entrega ao domicílio"
                      text={deliveryConfig.deliveryDescription}
                      price={(() => {
                        const fee = deliveryFeeFor(subtotal, 'entrega')
                        return fee === null ? 'Custo a combinar' : fee === 0 ? 'Grátis' : formatPrice(fee)
                      })()}
                    />
                  )}
                </div>
              </fieldset>

              {draft.delivery.method === 'entrega' && (
                <div className="space-y-5 rounded-2xl bg-cream-100/70 p-4 sm:p-5">
                  <p className="text-sm text-cocoa-700">{deliveryConfig.deliveryArea}</p>
                  <TextField
                    label="Morada"
                    required
                    autoComplete="street-address"
                    placeholder="Rua, número, andar"
                    value={draft.delivery.address}
                    onChange={(e) => setDelivery({ address: e.target.value })}
                    error={deliveryErrors.address}
                    maxLength={160}
                  />
                  <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                    <TextField
                      label="Código postal"
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="0000-000"
                      value={draft.delivery.postalCode}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
                        setDelivery({ postalCode: digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits })
                      }}
                      error={deliveryErrors.postalCode}
                    />
                    <TextField
                      label="Localidade"
                      required
                      autoComplete="address-level2"
                      value={draft.delivery.city}
                      onChange={(e) => setDelivery({ city: e.target.value })}
                      error={deliveryErrors.city}
                      maxLength={80}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={draft.delivery.method === 'entrega' ? 'Data de entrega pretendida' : 'Data de levantamento pretendida'}
                  optional
                  type="date"
                  min={today}
                  value={draft.delivery.preferredDate}
                  onChange={(e) => setDelivery({ preferredDate: e.target.value })}
                  error={deliveryErrors.preferredDate}
                  hint="Sujeita a confirmação pela loja."
                />
                <div>
                  <label htmlFor="periodo" className="mb-1.5 flex gap-1 text-sm font-semibold">
                    Período <span className="font-normal text-cocoa-500">(opcional)</span>
                  </label>
                  <select
                    id="periodo"
                    className="input"
                    value={draft.delivery.preferredTime}
                    onChange={(e) => setDelivery({ preferredTime: e.target.value })}
                  >
                    <option value="indiferente">Indiferente</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => goTo(0)}>
                  <ArrowLeft className="size-4" aria-hidden /> Voltar
                </Button>
                <Button size="lg" onClick={nextFromDelivery}>
                  Continuar para o resumo <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="mt-8 space-y-6" aria-labelledby="passo-resumo">
              <h2 id="passo-resumo" tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
                3. Confirmar o pedido
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <SummaryBlock title="Os seus dados" onEdit={() => goTo(0)}>
                  <p className="font-medium text-cocoa-900">{draft.customer.name}</p>
                  <p>{formatPhone(draft.customer.phone)}</p>
                  {draft.customer.email && <p>{draft.customer.email}</p>}
                </SummaryBlock>
                <SummaryBlock
                  title={draft.delivery.method === 'levantamento' ? 'Levantamento na loja' : 'Entrega ao domicílio'}
                  onEdit={() => goTo(1)}
                >
                  {draft.delivery.method === 'entrega' && (
                    <>
                      <p>{draft.delivery.address}</p>
                      <p>
                        {draft.delivery.postalCode} {draft.delivery.city}
                      </p>
                    </>
                  )}
                  <p>
                    {draft.delivery.preferredDate
                      ? `Data pretendida: ${draft.delivery.preferredDate.split('-').reverse().join('/')}`
                      : 'Data a combinar com a loja'}
                  </p>
                </SummaryBlock>
              </div>
              {draft.customer.notes.trim() && (
                <SummaryBlock title="Observações" onEdit={() => goTo(0)}>
                  <p className="whitespace-pre-line">{draft.customer.notes}</p>
                </SummaryBlock>
              )}

              <Alert tone="info" title="Como funciona o envio">
                <p>
                  Ao clicar no botão, abrimos o WhatsApp com a mensagem da encomenda já preenchida — só tem de a enviar. Este
                  passo <strong>não é um pagamento nem uma confirmação automática</strong>: a loja responde para confirmar a
                  disponibilidade, a data e a forma de pagamento.
                </p>
              </Alert>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-cocoa-800">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked)
                      setTermsError(false)
                    }}
                    className="mt-0.5 size-4 shrink-0 accent-brand-600"
                    aria-invalid={termsError || undefined}
                    aria-describedby={termsError ? 'terms-error' : undefined}
                  />
                  <span>
                    Li e aceito as{' '}
                    <Link to="/informacoes/encomendas" target="_blank" className="font-semibold text-brand-700 underline">
                      condições de encomenda
                    </Link>{' '}
                    e a{' '}
                    <Link to="/informacoes/privacidade" target="_blank" className="font-semibold text-brand-700 underline">
                      política de privacidade
                    </Link>
                    .
                  </span>
                </label>
                {termsError && (
                  <p id="terms-error" className="mt-2 text-sm font-medium text-brand-700">
                    Confirme que aceita as condições para continuar.
                  </p>
                )}
              </div>

              {!whatsappReady && (
                <Alert tone="error" title="Envio por WhatsApp indisponível">
                  <p>O número de WhatsApp da loja ainda não foi configurado, por isso não é possível enviar o pedido.</p>
                  {storeConfig.demoMode && (
                    <p className="text-xs opacity-80">
                      Configuração: defina <code>whatsappNumber</code> em <code>src/config/store.ts</code> ou a variável{' '}
                      <code>VITE_WHATSAPP_NUMBER</code>.
                    </p>
                  )}
                </Alert>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
                <Button variant="ghost" onClick={() => goTo(1)}>
                  <ArrowLeft className="size-4" aria-hidden /> Voltar
                </Button>
                <Button
                  size="lg"
                  onClick={send}
                  loading={sending}
                  disabled={!whatsappReady || hasIssues}
                  icon={<MessageCircle className="size-5" aria-hidden />}
                >
                  {sending ? 'A preparar o pedido…' : 'Enviar pedido pelo WhatsApp'}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="card p-5 sm:p-6 lg:sticky lg:top-24" aria-label="Resumo da encomenda">
          <h2 className="text-xl font-semibold">A sua encomenda</h2>
          <ul className="mt-4 divide-y divide-cocoa-900/10">
            {validLines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 py-3">
                <div className="relative shrink-0">
                  <ProductImage src={l.product!.image} alt="" width={112} className="size-14 rounded-xl" />
                  <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-cocoa-900 text-[11px] font-bold text-white">
                    {l.item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-semibold">{l.product!.name}</p>
                  {l.variantLabel && <p className="text-cocoa-500">{l.variantLabel}</p>}
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(l.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-cocoa-900/10 pt-4">
            <OrderTotals
              subtotal={subtotal}
              deliveryFee={step > 0 ? deliveryFee : undefined}
              method={step > 0 ? draft.delivery.method : undefined}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

function Stepper({ current, onSelect }: { current: number; onSelect: (i: number) => void }) {
  return (
    <ol className="flex items-center" aria-label="Passos da encomenda">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              disabled={!done}
              aria-current={active ? 'step' : undefined}
              className="flex items-center gap-2.5 disabled:cursor-default"
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-full text-sm font-bold transition',
                  done && 'bg-brand-600 text-white',
                  active && 'bg-brand-600 text-white ring-4 ring-brand-100',
                  !done && !active && 'border border-cocoa-900/15 bg-white text-cocoa-500',
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold',
                  active || done ? 'text-cocoa-900' : 'text-cocoa-500',
                  !active && 'hidden sm:inline',
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className={cn('mx-3 h-0.5 flex-1 rounded-full', done ? 'bg-brand-500' : 'bg-cocoa-900/10')} aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}

function MethodOption({
  value,
  current,
  onSelect,
  icon,
  title,
  text,
  price,
}: {
  value: DeliveryMethod
  current: DeliveryMethod
  onSelect: (m: DeliveryMethod) => void
  icon: React.ReactNode
  title: string
  text: string
  price: string
}) {
  const selected = value === current
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500',
        selected
          ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
          : 'border-cocoa-900/15 bg-white hover:border-cocoa-900/30',
      )}
    >
      <input type="radio" name="metodo" value={value} checked={selected} onChange={() => onSelect(value)} className="sr-only" />
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          selected ? 'bg-brand-600 text-white' : 'bg-cream-100 text-cocoa-700',
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-cocoa-900">{title}</span>
        <span className="mt-0.5 block text-sm text-cocoa-700">{text}</span>
        <span className="mt-1.5 block text-sm font-semibold text-brand-700">{price}</span>
      </span>
    </label>
  )
}

function SummaryBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cream-100/70 p-4 text-sm text-cocoa-700">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-semibold text-cocoa-900">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Alterar
        </button>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function OrderSent({ sent, onDone }: { sent: SentOrder; onDone: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sent.message)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="container-page max-w-3xl pt-10 sm:pt-14">
      <div className="card p-6 text-center sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CircleCheck className="size-8" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">Pedido preparado!</h1>
        <p className="mt-2 text-cocoa-700">
          Referência <strong className="text-cocoa-900">{sent.order.reference}</strong> · Total{' '}
          <strong className="text-cocoa-900">{formatPrice(sent.order.total)}</strong>
          {sent.order.deliveryFee === null && ' (sem entrega)'}
        </p>
        <p className="mx-auto mt-4 max-w-lg text-[15px] text-cocoa-700">
          Abrimos o WhatsApp com a mensagem da encomenda. <strong>Confirme que a enviou</strong> — a encomenda só fica confirmada
          depois da resposta da loja. Se o WhatsApp não abriu, use o botão abaixo.
        </p>
        {sent.saveStatus === 'saved' && (
          <p className="mt-3 text-sm text-emerald-700">O pedido ficou também registado no sistema da loja.</p>
        )}
        {sent.saveStatus === 'failed' && (
          <p className="mt-3 text-sm text-amber-800">
            Não foi possível registar o pedido no sistema da loja, mas o envio pelo WhatsApp continua válido.
          </p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={sent.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 font-semibold text-white hover:bg-brand-700"
          >
            <MessageCircle className="size-5" aria-hidden /> Abrir WhatsApp
          </a>
          <Link
            to="/loja"
            onClick={onDone}
            className="inline-flex h-13 items-center justify-center rounded-full border border-cocoa-900/20 px-7 font-semibold hover:bg-white"
          >
            Voltar à loja
          </Link>
        </div>
      </div>

      <details className="card mt-6 p-5 sm:p-6">
        <summary className="cursor-pointer font-semibold">Ver a mensagem enviada</summary>
        <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-cream-100 p-4 text-left font-sans text-sm whitespace-pre-wrap text-cocoa-800">
          {sent.message}
        </pre>
        <Button variant="outline" size="sm" className="mt-4" onClick={copy} icon={<Copy className="size-4" aria-hidden />}>
          {copied ? 'Copiada!' : 'Copiar mensagem'}
        </Button>
      </details>
    </div>
  )
}
