import { Link } from 'react-router-dom'
import { storeConfig } from '../../config/store'
import { cn } from '../../lib/cn'

/** Marca gráfica: um coração-bombom desenhado à mão. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 27.5c-.4 0-.8-.1-1.1-.4C8.3 21.6 4 17.6 4 12.4 4 8.8 6.8 6 10.3 6c2.3 0 4.3 1.2 5.7 3 1.4-1.8 3.4-3 5.7-3C25.2 6 28 8.8 28 12.4c0 5.2-4.3 9.2-10.9 14.7-.3.3-.7.4-1.1.4Z"
        fill="currentColor"
      />
      <path d="M10.5 11.2c.6-1.2 1.7-2 3-2.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".85" />
    </svg>
  )
}

export function Logo({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const { logo, name, tagline } = storeConfig
  return (
    <Link to="/" className={cn('inline-flex shrink-0 items-center gap-2', className)} aria-label={logo.alt}>
      {logo.image ? (
        <img src={logo.image} alt="" className="h-10 w-auto" />
      ) : (
        <>
          <LogoMark className="size-8 text-brand-500" />
          <span className="flex flex-col leading-none">
            <span
              className={cn(
                'font-display text-[1.55rem] font-semibold tracking-tight italic',
                tone === 'dark' ? 'text-cocoa-900' : 'text-white',
              )}
            >
              {name}
            </span>
            <span
              className={cn(
                'mt-0.5 hidden text-[9px] font-semibold tracking-[0.2em] uppercase sm:block',
                tone === 'dark' ? 'text-brand-600' : 'text-brand-200',
              )}
            >
              {tagline}
            </span>
          </span>
        </>
      )}
    </Link>
  )
}
