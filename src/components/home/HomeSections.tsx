import { ArrowRight, HandHeart, MessageCircle, ShoppingBag, Store } from 'lucide-react'
import { storeConfig } from '../../config/store'
import { useCatalog } from '../../context/CatalogContext'
import { pexels } from '../../lib/images'
import { isOnSale } from '../../lib/pricing'
import { LogoMark } from '../layout/Logo'
import { ButtonLink } from '../ui/Button'
import { ProductImage } from '../ui/ProductImage'

const PROMO_IMAGE = pexels(40437037)
const ABOUT_IMAGES = [pexels(39005666), pexels(38545228)]

export function PromoBanner() {
  const { products } = useCatalog()
  const count = products.filter(isOnSale).length
  if (!storeConfig.promotions.enabled || count === 0) return null

  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="grid overflow-hidden rounded-[2rem] bg-brand-100 sm:grid-cols-[1fr_1.15fr]">
        <ProductImage
          src={PROMO_IMAGE}
          alt="Mesa de sobremesas com trufas de chocolate e morangos"
          width={640}
          ratio={0.7}
          sizes="(min-width: 640px) 45vw, 100vw"
          className="aspect-[1/0.7] h-full w-full sm:aspect-auto"
        />
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="eyebrow">{count} produtos com desconto</p>
          <h2 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">{storeConfig.promotions.bannerTitle}</h2>
          <p className="mt-3 max-w-md text-cocoa-700">{storeConfig.promotions.bannerText}</p>
          <div className="mt-7">
            <ButtonLink to="/loja?promocoes=1" variant="dark">
              Ver promoções <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}

const steps = [
  {
    icon: ShoppingBag,
    title: 'Escolha os seus doces',
    text: 'Adicione ao carrinho os produtos, tamanhos e quantidades que pretende.',
  },
  {
    icon: MessageCircle,
    title: 'Envie o pedido pelo WhatsApp',
    text: 'Indique os seus dados e o método de entrega. A mensagem é preparada automaticamente.',
  },
  {
    icon: Store,
    title: 'Confirmamos consigo',
    text: 'A loja confirma disponibilidade, data e forma de pagamento antes de preparar a encomenda.',
  },
]

export function HowItWorks() {
  return (
    <section className="container-page mt-20 sm:mt-24" aria-labelledby="como-funciona">
      <div className="rounded-[2rem] border border-cocoa-900/[0.07] bg-white px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
        <div className="max-w-xl">
          <p className="eyebrow">Como encomendar</p>
          <h2 id="como-funciona" className="mt-2 text-3xl font-semibold sm:text-4xl">
            Simples, rápido e com confirmação pessoal
          </h2>
        </div>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <s.icon className="size-6" aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold text-cocoa-500">Passo {i + 1}</span>
              </div>
              <h3 className="mt-4 font-sans text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-cocoa-700">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function AboutTeaser() {
  return (
    <section className="container-page mt-20 grid items-center gap-10 sm:mt-24 lg:grid-cols-2 lg:gap-16">
      <div className="grid grid-cols-[1.2fr_1fr] gap-3 sm:gap-4">
        <ProductImage
          src={ABOUT_IMAGES[0]!}
          alt="Frascos de vidro com doces sortidos numa loja de doces"
          width={420}
          ratio={1.3}
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="aspect-[1/1.3] w-full rounded-3xl"
        />
        <div className="flex flex-col gap-3 pt-10 sm:gap-4">
          <ProductImage
            src={ABOUT_IMAGES[1]!}
            alt="Frascos com tampas douradas cheios de doces coloridos"
            width={360}
            sizes="(min-width: 1024px) 20vw, 40vw"
            className="aspect-square w-full rounded-3xl"
          />
          <div className="rounded-3xl bg-cocoa-900 p-5 text-cream-100">
            <LogoMark className="size-7 text-brand-300" />
            <p className="mt-3 font-display text-lg leading-snug">Doces escolhidos com o mesmo cuidado com que os oferecemos.</p>
          </div>
        </div>
      </div>
      <div>
        <p className="eyebrow">Sobre nós</p>
        <h2 className="mt-2 text-3xl leading-tight font-semibold sm:text-4xl">Uma loja de doces feita para partilhar</h2>
        <p className="mt-4 text-[17px] leading-relaxed text-cocoa-700">
          A {storeConfig.name} nasceu do gosto por juntar pessoas à volta de uma mesa de doces. Selecionamos chocolates, gomas,
          bolachas e especialidades para todos os momentos — do lanche de domingo à festa de aniversário.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            'Seleção variada, do clássico ao importado',
            'Caixas e combos prontos para oferecer',
            'Atendimento próximo, por WhatsApp ou na loja',
          ].map((t) => (
            <li key={t} className="flex items-center gap-3 text-cocoa-800">
              <HandHeart className="size-5 shrink-0 text-brand-600" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
        <ButtonLink to="/sobre" variant="outline" className="mt-8">
          Conhecer a nossa história <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
    </section>
  )
}

export function ClosingBand() {
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="flex flex-col items-start gap-6 rounded-[2rem] bg-brand-600 px-7 py-10 text-white sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <div className="flex items-center gap-4">
          <LogoMark className="hidden size-12 text-white/90 sm:block" />
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Doces momentos, sempre.</h2>
            <p className="mt-1 text-white/85">Descubra a loja completa e prepare a sua próxima encomenda.</p>
          </div>
        </div>
        <ButtonLink to="/loja" variant="secondary" size="lg" className="shrink-0">
          Ver a loja <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
      </div>
    </section>
  )
}
