import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Search, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useUI } from '../../context/UIContext'
import { cn } from '../../lib/cn'
import { Logo } from './Logo'

export const mainNav = [
  { to: '/', label: 'Início', end: true },
  { to: '/loja', label: 'Loja' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/sobre', label: 'Sobre nós' },
  { to: '/contactos', label: 'Contactos' },
]

export function Header() {
  const { itemCount, pulse } = useCart()
  const { setCartOpen, setSearchOpen, setMenuOpen } = useUI()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Atalho de teclado "/" para abrir a pesquisa.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key !== '/' || target.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  const iconBtn = 'relative flex size-11 items-center justify-center rounded-full text-cocoa-900 transition hover:bg-cocoa-900/5'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-cocoa-900/10 bg-cream-50/90 shadow-[0_6px_24px_-18px_rgba(59,36,32,0.5)] backdrop-blur-md'
          : 'border-transparent bg-cream-50',
      )}
    >
      <div className="container-page flex h-16 items-center gap-2 sm:h-[72px]">
        <button
          type="button"
          className={cn(iconBtn, '-ml-2 lg:hidden')}
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-6" aria-hidden />
        </button>

        <Logo />

        <nav aria-label="Principal" className="ml-10 hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-full px-3.5 py-2 text-[15px] font-medium transition',
                      isActive ? 'text-brand-700' : 'text-cocoa-800 hover:text-cocoa-900 hover:bg-cocoa-900/5',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className={cn(
              iconBtn,
              'sm:w-auto sm:gap-2 sm:rounded-full sm:border sm:border-cocoa-900/10 sm:bg-white sm:pr-4 sm:pl-3.5',
            )}
            onClick={() => setSearchOpen(true)}
            aria-label="Pesquisar produtos"
          >
            <Search className="size-5" aria-hidden />
            <span className="hidden text-sm text-cocoa-500 sm:inline">Pesquisar</span>
            <kbd className="hidden rounded border border-cocoa-900/15 px-1.5 text-[11px] text-cocoa-500 xl:inline">/</kbd>
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => setCartOpen(true)}
            aria-label={`Abrir carrinho, ${itemCount} ${itemCount === 1 ? 'artigo' : 'artigos'}`}
          >
            <ShoppingBag className="size-[22px]" aria-hidden />
            {itemCount > 0 && (
              <span
                key={pulse}
                className="bump absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white tabular-nums ring-2 ring-cream-50"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
