import { Link } from 'react-router-dom'
import { ArrowRight, Gift, Store, Truck } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { pexels } from '../../lib/images'
import { formatPrice } from '../../lib/money'
import { lowestPrice } from '../../lib/pricing'
import { ButtonLink } from '../ui/Button'
import { ProductImage } from '../ui/ProductImage'

/** Imagem principal da página inicial — substitua por uma fotografia da loja. */
const HERO_IMAGE = pexels(37276004)
/** Produto destacado no pequeno cartão sobre a imagem */
const HERO_PRODUCT_SLUG = 'caixa-de-trufas-premium'

export function Hero() {
  const { getProductBySlug } = useCatalog()
  const featured = getProductBySlug(HERO_PRODUCT_SLUG)

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-brand-100/70 blur-3xl"
      />
      <div className="container-page relative grid items-center gap-10 pt-8 pb-14 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-16 lg:pb-24">
        <div className="fade-up">
          <p className="eyebrow">Chocolates · Gomas · Caixas de oferta</p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.05] font-semibold text-cocoa-900 sm:text-6xl lg:text-[4.1rem]">
            A vida sabe melhor <em className="font-medium text-brand-600">com um doce.</em>
          </h1>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-cocoa-700">
            Doces escolhidos com cuidado para partilhar, oferecer ou simplesmente saborear. Encomende online e levante na loja ou
            receba em casa.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/loja" size="lg">
              Explorar produtos <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink to="/contactos#personalizadas" size="lg" variant="outline">
              Encomendas personalizadas
            </ButtonLink>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-cocoa-700">
            <li className="flex items-center gap-2">
              <Store className="size-4 text-brand-600" aria-hidden /> Levantamento na loja
            </li>
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-brand-600" aria-hidden /> Entregas ao domicílio
            </li>
            <li className="flex items-center gap-2">
              <Gift className="size-4 text-brand-600" aria-hidden /> Caixas para oferta
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] shadow-lift">
            <ProductImage
              src={HERO_IMAGE}
              alt="Trufas de chocolate decoradas com flores cor-de-rosa"
              width={760}
              ratio={0.92}
              sizes="(min-width: 1024px) 46vw, 100vw"
              priority
              className="aspect-[1/0.92] w-full"
            />
          </div>
          {featured && (
            <Link
              to={`/produto/${featured.slug}`}
              className="group absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-white/95 p-2.5 pr-5 shadow-lift backdrop-blur transition hover:-translate-y-0.5 sm:left-auto sm:-right-4 lg:-left-8 lg:right-auto"
            >
              <ProductImage src={featured.image} alt="" width={112} className="size-14 rounded-xl" />
              <span>
                <span className="block text-xs font-medium text-cocoa-500">Para oferecer</span>
                <span className="block text-sm font-semibold text-cocoa-900">{featured.name}</span>
                <span className="block text-sm text-brand-700 tabular-nums">desde {formatPrice(lowestPrice(featured))}</span>
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
