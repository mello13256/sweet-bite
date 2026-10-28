import { ArrowRight, Gem, HandHeart, Sparkles } from 'lucide-react'
import { LogoMark } from '../components/layout/Logo'
import { ButtonLink } from '../components/ui/Button'
import { ProductImage } from '../components/ui/ProductImage'
import { aboutContent } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import { pexels } from '../lib/images'

/** Fotografias ilustrativas — substitua por fotografias reais da loja. */
const COVER = pexels(39150144)
const GALLERY = [
  { src: pexels(39005666), alt: 'Frascos de vidro com doces sortidos' },
  { src: pexels(4094589), alt: 'Prateleira com frascos de doces coloridos' },
  { src: pexels(38545228), alt: 'Frascos com tampas douradas e doces coloridos' },
]
const valueIcons = [Gem, Sparkles, HandHeart]

export default function AboutPage() {
  usePageMeta('Sobre nós', aboutContent.intro)
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-cocoa-900">
        <ProductImage
          src={COVER}
          alt=""
          width={1600}
          ratio={0.45}
          sizes="100vw"
          priority
          className="absolute inset-0 -z-10 size-full opacity-55"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-cocoa-900/90 via-cocoa-900/40 to-cocoa-900/20" />
        <div className="container-page py-20 sm:py-28">
          <p className="eyebrow text-brand-200">Sobre nós</p>
          <h1 className="mt-3 max-w-2xl text-4xl leading-tight font-semibold text-white sm:text-6xl">
            Mais do que doces, criamos momentos.
          </h1>
        </div>
      </section>

      <section className="container-page mt-16 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <h2 className="text-3xl font-semibold sm:text-4xl">{aboutContent.title}</h2>
        </div>
        <div className="space-y-5 text-[17px] leading-relaxed text-cocoa-700">
          <p className="text-cocoa-900">{aboutContent.intro}</p>
          {aboutContent.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>

      <section className="container-page mt-16" aria-label="Os nossos valores">
        <ul className="grid gap-4 md:grid-cols-3">
          {aboutContent.values.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length]!
            return (
              <li key={v.title} className="card p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="size-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-xl font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-[15px] text-cocoa-700">{v.text}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="container-page mt-16" aria-label="Galeria">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {GALLERY.map((g, i) => (
            <li key={g.src} className={i === 0 ? 'col-span-2 sm:col-span-1' : ''}>
              <ProductImage
                src={g.src}
                alt={g.alt}
                width={520}
                ratio={0.8}
                sizes="(min-width: 640px) 32vw, 50vw"
                className="aspect-[1/0.8] w-full rounded-3xl"
              />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-cocoa-500">Imagens ilustrativas.</p>
      </section>

      <section className="container-page mt-16">
        <div className="flex flex-col items-center rounded-[2rem] bg-brand-100 px-6 py-12 text-center">
          <LogoMark className="size-10 text-brand-600" />
          <p className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{aboutContent.closing}</p>
          <ButtonLink to="/loja" className="mt-7">
            Explorar a loja <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </section>
    </div>
  )
}
