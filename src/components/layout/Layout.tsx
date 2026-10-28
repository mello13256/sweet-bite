import { Suspense, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { storeConfig } from '../../config/store'
import { useCatalog } from '../../context/CatalogContext'
import { CartDrawer } from '../cart/CartDrawer'
import { Skeleton } from '../ui/misc'
import { Footer } from './Footer'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'
import { SearchDialog } from './SearchDialog'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

function PageFallback() {
  return (
    <div className="container-page space-y-4 py-12" aria-busy="true" aria-label="A carregar">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-72" />
    </div>
  )
}

export function Layout() {
  const { notice } = useCatalog()
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only z-[80] rounded-full bg-cocoa-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar para o conteúdo
      </a>
      {storeConfig.demoMode && (
        <div className="bg-cocoa-900 px-4 py-2 text-center text-xs text-cream-100">
          Loja de demonstração — produtos, preços e imagens são ilustrativos.
        </div>
      )}
      {notice && (
        <div role="status" className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-950">
          {notice}
        </div>
      )}
      <Header />
      <main id="conteudo" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <MobileMenu />
      <SearchDialog />
      <ScrollToTop />
    </div>
  )
}
