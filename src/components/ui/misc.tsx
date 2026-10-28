import type { ReactNode } from 'react'
import { CircleAlert, Info, TriangleAlert } from 'lucide-react'
import { cn } from '../../lib/cn'

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Tag = 'h2',
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <Tag className="text-[1.75rem] leading-tight font-semibold text-cocoa-900 sm:text-[2.1rem]">{title}</Tag>
        {description && <p className="mt-2 text-[15px] text-cocoa-700 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  )
}

const alertTones = {
  info: { box: 'border-sky-900/10 bg-sky-50 text-sky-950', icon: Info },
  warning: { box: 'border-amber-900/10 bg-amber-50 text-amber-950', icon: TriangleAlert },
  error: { box: 'border-brand-700/15 bg-brand-50 text-brand-800', icon: CircleAlert },
}

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: keyof typeof alertTones
  title?: string
  children?: ReactNode
  className?: string
}) {
  const { box, icon: Icon } = alertTones[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'note'} className={cn('flex gap-3 rounded-2xl border p-4 text-sm', box, className)}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1 leading-relaxed">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">{icon}</div>
      <p className="font-display text-xl font-semibold text-cocoa-900">{title}</p>
      {description && <p className="mt-2 max-w-sm text-[15px] text-cocoa-700">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-xl', className)} aria-hidden />
}

/** Etiqueta discreta para conteúdos que ainda têm de ser configurados. */
export function ConfigPending({ children = 'Por configurar' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-cocoa-500/50 px-2.5 py-0.5 text-xs font-medium text-cocoa-700">
      {children}
    </span>
  )
}
