import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CircleCheck, CircleAlert, X } from 'lucide-react'
import { cn } from '../lib/cn'

interface Toast {
  id: number
  title: string
  description?: string
  tone: 'success' | 'error'
  action?: { label: string; to: string }
}

interface ToastContextValue {
  notify: (toast: Omit<Toast, 'id'>) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const notify = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-2), { ...toast, id }])
      window.setTimeout(() => dismiss(id), 3800)
    },
    [dismiss],
  )

  const dismissAll = useCallback(() => setToasts([]), [])
  const value = useMemo(() => ({ notify, dismissAll }), [notify, dismissAll])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-cocoa-900/10 bg-white p-4 shadow-[0_12px_40px_-12px_rgba(59,36,32,0.35)]"
          >
            {t.tone === 'success' ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            ) : (
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cocoa-900">{t.title}</p>
              {t.description && <p className="mt-0.5 truncate text-sm text-cocoa-700">{t.description}</p>}
              {t.action && (
                <Link
                  to={t.action.to}
                  onClick={() => dismiss(t.id)}
                  className={cn('mt-2 inline-block text-sm font-semibold text-brand-600 underline-offset-4 hover:underline')}
                >
                  {t.action.label}
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-m-1 rounded-full p-1 text-cocoa-700 hover:bg-cream-100"
              aria-label="Fechar notificação"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}
