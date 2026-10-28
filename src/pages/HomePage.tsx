import { ArrowRight } from 'lucide-react'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedTabs } from '../components/home/FeaturedTabs'
import { Hero } from '../components/home/Hero'
import { AboutTeaser, ClosingBand, HowItWorks, PromoBanner } from '../components/home/HomeSections'
import { ButtonLink } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/misc'
import { usePageMeta } from '../hooks/usePageMeta'

export default function HomePage() {
  usePageMeta()
  return (
    <>
      <Hero />

      <section className="container-page mt-4" aria-labelledby="categorias-titulo">
        <div id="categorias-titulo">
          <SectionHeading
            eyebrow="Categorias"
            title="O que lhe apetece hoje?"
            description="Escolha uma categoria e descubra os doces correspondentes."
            action={
              <ButtonLink to="/loja" variant="outline" size="sm">
                Ver todos os produtos <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            }
          />
        </div>
        <div className="mt-8">
          <CategoryGrid />
        </div>
      </section>

      <FeaturedTabs />
      <PromoBanner />
      <HowItWorks />
      <AboutTeaser />
      <ClosingBand />
    </>
  )
}
