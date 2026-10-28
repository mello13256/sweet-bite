import { Candy } from 'lucide-react'
import { ButtonLink } from '../components/ui/Button'
import { EmptyState } from '../components/ui/misc'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta('Página não encontrada')
  return (
    <div className="container-page py-16">
      <h1 className="sr-only">Página não encontrada</h1>
      <EmptyState
        icon={<Candy className="size-7" aria-hidden />}
        title="Ups! Esta página não existe."
        description="O endereço pode estar incorreto ou a página foi removida."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink to="/">Ir para o início</ButtonLink>
            <ButtonLink to="/loja" variant="outline">
              Ver a loja
            </ButtonLink>
          </div>
        }
      />
    </div>
  )
}
