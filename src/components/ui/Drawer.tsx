import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useDialog } from '../../hooks/useDialog'
import { cn } from '../../lib/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  children: ReactNode
  footer?: ReactNode
}

/** Gaveta lateral acessível (carrinho, menu móvel). */
export function Drawer({ open, onClose, title, side = 'right', children, footer }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDialog(open, onClose, panelRef)
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="overlay-in absolute inset-0 bg-cocoa-900/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        // Fecha logo ao seguir um link (sem esperar que a página seguinte carregue).
        onClick={(e) => {
          const link = (e.target as HTMLElement).closest('a[href]')
          if (link && link.getAttribute('aria-disabled') !== 'true') onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute inset-y-0 flex w-full max-w-[420px] flex-col bg-cream-50 shadow-2xl',
          side === 'right' ? 'drawer-right-in right-0' : 'drawer-left-in left-0',
        )}
      >
        <div className="flex items-center justify-between border-b border-cocoa-900/10 px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 rounded-full p-2 text-cocoa-800 hover:bg-cocoa-900/5"
            aria-label="Fechar"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-cocoa-900/10 bg-white px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
