import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone, Store, Truck } from 'lucide-react'
import { SocialIcon } from '../components/layout/SocialIcon'
import { Button } from '../components/ui/Button'
import { TextAreaField, TextField } from '../components/ui/Field'
import { Alert, ConfigPending, SectionHeading } from '../components/ui/misc'
import { storeConfig } from '../config/store'
import { faqs } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatPhone, isValidPortuguesePhone, todayISO } from '../lib/validation'
import { buildWhatsAppUrl, isWhatsAppConfigured } from '../lib/whatsapp'

export default function ContactPage() {
  usePageMeta('Contactos', 'Contactos, horário, entregas, encomendas personalizadas e perguntas frequentes.')
  const { contact, social, openingHours, delivery, name } = storeConfig
  const whatsapp = isWhatsAppConfigured()
  const socials = social.filter((s) => s.url)

  return (
    <div className="container-page pt-10 sm:pt-14">
      <SectionHeading
        as="h1"
        eyebrow="Contactos"
        title="Estamos aqui para ajudar"
        description="Fale connosco para dúvidas, encomendas especiais ou para saber mais sobre os nossos produtos."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          <div className="card divide-y divide-cocoa-900/[0.07]">
            <ContactRow icon={<Phone className="size-5" aria-hidden />} title="Telefone">
              {contact.phone ? (
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-brand-700">
                  {contact.phone}
                </a>
              ) : (
                <ConfigPending />
              )}
            </ContactRow>
            <ContactRow icon={<MessageCircle className="size-5" aria-hidden />} title="WhatsApp">
              {whatsapp ? (
                <a
                  href={buildWhatsAppUrl(`Olá ${name}! Tenho uma questão:`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Falar connosco no WhatsApp
                </a>
              ) : (
                <ConfigPending />
              )}
            </ContactRow>
            <ContactRow icon={<Mail className="size-5" aria-hidden />} title="Email">
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="hover:text-brand-700">
                  {contact.email}
                </a>
              ) : (
                <ConfigPending />
              )}
            </ContactRow>
            <ContactRow icon={<MapPin className="size-5" aria-hidden />} title="Loja">
              {contact.address ? (
                <>
                  <span className="block">{contact.address}</span>
                  {contact.mapsUrl && (
                    <a
                      href={contact.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-brand-700 hover:underline"
                    >
                      Ver no mapa
                    </a>
                  )}
                </>
              ) : (
                <ConfigPending>Morada por configurar</ConfigPending>
              )}
            </ContactRow>
            <ContactRow icon={<Clock className="size-5" aria-hidden />} title="Horário de funcionamento">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5">
                {openingHours.map((h) => (
                  <div key={h.days} className="contents">
                    <dt>{h.days}</dt>
                    <dd className="font-medium text-cocoa-900">{h.hours}</dd>
                  </div>
                ))}
              </dl>
            </ContactRow>
          </div>

          <div className="card p-5 sm:p-6">
            <p className="font-semibold">Entregas e levantamentos</p>
            <ul className="mt-3 space-y-3 text-[15px] text-cocoa-700">
              {delivery.pickupEnabled && (
                <li className="flex gap-3">
                  <Store className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  {delivery.pickupDescription}
                </li>
              )}
              {delivery.deliveryEnabled && (
                <li className="flex gap-3">
                  <Truck className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span>
                    {delivery.deliveryDescription} {delivery.deliveryArea}
                  </span>
                </li>
              )}
            </ul>
            <Link to="/informacoes/entregas" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
              Mais informações sobre entregas
            </Link>
          </div>

          <div className="card p-5 sm:p-6">
            <p className="font-semibold">Siga-nos nas redes sociais</p>
            {socials.length ? (
              <ul className="mt-3 flex gap-2">
                {socials.map((s) => (
                  <li key={s.network}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-600 hover:text-white"
                    >
                      <SocialIcon network={s.network} className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2">
                <ConfigPending>Redes sociais por configurar</ConfigPending>
              </p>
            )}
          </div>
        </div>

        <CustomOrderForm />
      </div>

      <section id="perguntas" className="mt-20 scroll-mt-24" aria-labelledby="faq-titulo">
        <h2 id="faq-titulo" className="text-3xl font-semibold">
          Perguntas frequentes
        </h2>
        <div className="mt-6 divide-y divide-cocoa-900/10 rounded-3xl border border-cocoa-900/[0.07] bg-white px-5 shadow-card sm:px-7">
          {faqs.map((f) => (
            <details key={f.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-cocoa-900">
                {f.q}
                <ChevronDown className="size-5 shrink-0 text-cocoa-500 transition group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-cocoa-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

function ContactRow({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4 p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0 text-[15px] text-cocoa-700">
        <p className="mb-0.5 font-semibold text-cocoa-900">{title}</p>
        {children}
      </div>
    </div>
  )
}

const occasions = ['Aniversário', 'Casamento ou batizado', 'Evento de empresa', 'Caixa de oferta', 'Outra ocasião']

function CustomOrderForm() {
  const whatsapp = isWhatsAppConfigured()
  const [form, setForm] = useState({ name: '', phone: '', occasion: occasions[0]!, date: '', people: '', details: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})
  const [opened, setOpened] = useState(false)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (form.name.trim().length < 2) next.name = 'Indique o seu nome.'
    if (!isValidPortuguesePhone(form.phone)) next.phone = 'Indique um número português válido (9 dígitos).'
    if (form.details.trim().length < 10) next.details = 'Descreva o que pretende (mínimo 10 caracteres).'
    if (form.date && form.date < todayISO()) next.date = 'Escolha uma data a partir de hoje.'
    setErrors(next)
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('#personalizadas [aria-invalid="true"]')?.focus())
      return
    }
    const lines = [
      `*Pedido de encomenda personalizada — ${storeConfig.name}*`,
      '',
      `Nome: ${form.name.trim()}`,
      `Telemóvel: ${formatPhone(form.phone)}`,
      `Ocasião: ${form.occasion}`,
      form.date ? `Data pretendida: ${form.date.split('-').reverse().join('/')}` : '',
      form.people ? `Nº de pessoas (aprox.): ${form.people}` : '',
      '',
      '*O que pretendo*',
      form.details.trim(),
    ].filter((l, i, arr) => l !== '' || arr[i - 1] !== '')
    window.open(buildWhatsAppUrl(lines.join('\n')), '_blank', 'noopener,noreferrer')
    setOpened(true)
  }

  return (
    <section id="personalizadas" className="card scroll-mt-24 p-5 sm:p-8" aria-labelledby="personalizadas-titulo">
      <p className="eyebrow">Encomendas personalizadas</p>
      <h2 id="personalizadas-titulo" className="mt-2 text-3xl font-semibold">
        Vamos preparar algo especial?
      </h2>
      <p className="mt-2 text-[15px] text-cocoa-700">
        Caixas de oferta, mesas de doces, lembranças para eventos… Conte-nos o que procura e respondemos com uma proposta.
      </p>

      <form onSubmit={submit} noValidate className="mt-6 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nome"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            error={errors.name}
            maxLength={80}
          />
          <TextField
            label="Telemóvel"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            error={errors.phone}
            maxLength={20}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="ocasiao" className="mb-1.5 block text-sm font-semibold">
              Ocasião
            </label>
            <select id="ocasiao" className="input" value={form.occasion} onChange={(e) => set({ occasion: e.target.value })}>
              {occasions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <TextField
            label="Data"
            optional
            type="date"
            min={todayISO()}
            value={form.date}
            onChange={(e) => set({ date: e.target.value })}
            error={errors.date}
          />
          <TextField
            label="Pessoas"
            optional
            type="number"
            inputMode="numeric"
            min={1}
            max={1000}
            value={form.people}
            onChange={(e) => set({ people: e.target.value.replace(/\D/g, '').slice(0, 4) })}
          />
        </div>
        <TextAreaField
          label="O que pretende?"
          required
          placeholder="Ex.: caixa com 20 trufas e mensagem de parabéns; mesa de doces em tons de rosa para 30 pessoas…"
          value={form.details}
          onChange={(e) => set({ details: e.target.value })}
          error={errors.details}
          maxLength={800}
          rows={5}
        />

        {!whatsapp && (
          <Alert tone="error">
            O número de WhatsApp da loja ainda não foi configurado, por isso este pedido não pode ser enviado.
          </Alert>
        )}
        {opened && whatsapp && (
          <Alert tone="info">Abrimos o WhatsApp com o seu pedido. Não se esqueça de enviar a mensagem!</Alert>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!whatsapp}
          className="w-full sm:w-auto"
          icon={<MessageCircle className="size-5" aria-hidden />}
        >
          Enviar pedido pelo WhatsApp
        </Button>
      </form>
    </section>
  )
}
