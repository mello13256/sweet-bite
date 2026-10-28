import { CategoryGrid } from '../components/home/CategoryGrid'
import { SectionHeading } from '../components/ui/misc'
import { usePageMeta } from '../hooks/usePageMeta'

export default function CategoriesPage() {
  usePageMeta('Categorias', 'Chocolates, gomas, rebuçados, bolachas, marshmallows, doces importados, caixas de oferta e combos.')
  return (
    <div className="container-page pt-10 sm:pt-14">
      <SectionHeading
        as="h1"
        eyebrow="Categorias"
        title="Encontre o doce certo"
        description="Escolha uma categoria para ver os produtos correspondentes."
      />
      <div className="mt-8">
        <CategoryGrid />
      </div>
    </div>
  )
}
