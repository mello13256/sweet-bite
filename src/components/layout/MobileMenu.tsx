import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { storeConfig } from '../../config/store'
import { useCatalog } from '../../context/CatalogContext'
import { useUI } from '../../context/UIContext'
import { cn } from '../../lib/cn'
import { Drawer } from '../ui/Drawer'
import { mainNav } from './Header'
import { SocialIcon } from './SocialIcon'

export function MobileMenu() {
  const { menuOpen, setMenuOpen } = useUI()
  const { categories } = useCatalog()
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location, setMenuOpen])

  const socials = storeConfig.social.filter((s) => s.url)

  return (
    <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="left">
      <nav aria-label="Menu móvel" className="px-3 py-4">
        <ul>
          {mainNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-xl px-3 py-3 text-lg font-semibold',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-cocoa-900 hover:bg-cocoa-900/5',
                  )
                }
              >
                {item.label}
                <ChevronRight className="size-5 opacity-40" aria-hidden />
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-6 mb-2 px-3">Categorias</p>
        <ul className="grid grid-cols-2 gap-2 px-1">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                to={`/loja?categoria=${c.id}`}
                className="block rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-cocoa-800 shadow-card hover:text-brand-700"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>

        {socials.length > 0 && (
          <div className="mt-8 flex gap-2 px-3">
            {socials.map((s) => (
              <a
                key={s.network}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-11 items-center justify-center rounded-full bg-white text-cocoa-800 shadow-card"
                aria-label={s.label}
              >
                <SocialIcon network={s.network} className="size-5" />
              </a>
            ))}
          </div>
        )}
      </nav>
    </Drawer>
  )
}
