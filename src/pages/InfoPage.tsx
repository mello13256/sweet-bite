import { Link, useParams } from 'react-router-dom'
import { infoPages } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'
import { cn } from '../lib/cn'
import NotFoundPage from './NotFoundPage'

export default function InfoPage() {
  const { slug } = useParams()
  const page = infoPages.find((p) => p.slug === slug)
  usePageMeta(page?.title ?? 'Página não encontrada', page?.intro)
  if (!page) return <NotFoundPage />

  return (
    <div className="container-page grid gap-10 pt-10 sm:pt-14 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Informações" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:gap-1">
          {infoPages.map((p) => (
            <li key={p.slug} className="shrink-0">
              <Link
                to={`/informacoes/${p.slug}`}
                aria-current={p.slug === page.slug ? 'page' : undefined}
                className={cn(
                  'block rounded-xl px-3 py-2 text-sm font-medium transition',
                  p.slug === page.slug ? 'bg-brand-50 text-brand-700' : 'text-cocoa-700 hover:bg-white',
                )}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <article className="max-w-3xl min-w-0">
        <h1 className="text-4xl font-semibold sm:text-5xl">{page.title}</h1>
        <p className="mt-4 rounded-2xl bg-cream-100 p-4 text-[15px] leading-relaxed text-cocoa-700">{page.intro}</p>
        {page.sections.map((s) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-2xl font-semibold">{s.heading}</h2>
            {s.body.map((b) => (
              <p key={b} className="mt-3 text-[16px] leading-relaxed text-cocoa-700">
                {b}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  )
}
