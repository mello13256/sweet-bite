import { Link } from 'react-router-dom'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { storeConfig } from '../../config/store'
import { buildWhatsAppUrl, isWhatsAppConfigured } from '../../lib/whatsapp'
import { Logo } from './Logo'
import { SocialIcon } from './SocialIcon'

const columns = [
  {
    title: 'Loja',
    links: [
      { to: '/loja', label: 'Todos os produtos' },
      { to: '/categorias', label: 'Categorias' },
      { to: '/loja?promocoes=1', label: 'Promoções' },
      { to: '/loja?ordem=novidades', label: 'Novidades' },
      { to: '/loja?categoria=caixas-oferta', label: 'Caixas de oferta' },
    ],
  },
  {
    title: 'A SweetBite',
    links: [
      { to: '/sobre', label: 'Sobre nós' },
      { to: '/contactos', label: 'Contactos' },
      { to: '/contactos#personalizadas', label: 'Encomendas personalizadas' },
      { to: '/contactos#perguntas', label: 'Perguntas frequentes' },
    ],
  },
  {
    title: 'Informações',
    links: [
      { to: '/informacoes/entregas', label: 'Entregas e levantamentos' },
      { to: '/informacoes/encomendas', label: 'Condições de encomenda' },
      { to: '/informacoes/alergenios', label: 'Alergénios' },
      { to: '/informacoes/privacidade', label: 'Política de privacidade' },
    ],
  },
]

export function Footer() {
  const { contact, social, openingHours, name } = storeConfig
  const socials = social.filter((s) => s.url)
  const whatsapp = isWhatsAppConfigured()

  return (
    <footer className="mt-24 bg-cocoa-900 text-cream-100">
      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-200/75">
            Doces escolhidos com cuidado para os pequenos e grandes momentos. Encomende online e levante na loja ou receba em
            casa.
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map((s) => (
                <li key={s.network}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand-500"
                  >
                    <SocialIcon network={s.network} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 text-sm font-semibold text-white">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-cream-200/75 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold text-white">Contactos</p>
          <ul className="space-y-3 text-sm text-cream-200/75">
            {contact.phone && (
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-brand-300" aria-hidden />
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-white">
                  {contact.phone}
                </a>
              </li>
            )}
            {whatsapp && (
              <li className="flex items-center gap-2.5">
                <MessageCircle className="size-4 text-brand-300" aria-hidden />
                <a href={buildWhatsAppUrl(`Olá ${name}!`)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  WhatsApp
                </a>
              </li>
            )}
            {contact.email && (
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-brand-300" aria-hidden />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden />
                <span>{contact.address}</span>
              </li>
            )}
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand-300" aria-hidden />
              <span>
                {openingHours.map((h) => (
                  <span key={h.days} className="block">
                    {h.days}: {h.hours}
                  </span>
                ))}
              </span>
            </li>
            {!contact.phone && !contact.email && !whatsapp && (
              <li>
                <Link to="/contactos" className="underline underline-offset-4 hover:text-white">
                  Ver página de contactos
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-cream-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {name}. Todos os direitos reservados.
          </p>
          <p>As encomendas feitas pelo site são confirmadas pela loja via WhatsApp. Imagens ilustrativas.</p>
        </div>
      </div>
    </footer>
  )
}
