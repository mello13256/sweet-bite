import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

interface BaseProps {
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
}

function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  required,
  children,
}: BaseProps & { id: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-1 text-sm font-semibold text-cocoa-900">
        {label}
        {required && (
          <span className="text-brand-600" aria-hidden>
            *
          </span>
        )}
        {optional && <span className="font-normal text-cocoa-500">(opcional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-cocoa-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function TextField({
  label,
  error,
  hint,
  optional,
  className,
  id,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} optional={optional} required={rest.required}>
      <input
        id={fieldId}
        className={cn('input', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...rest}
      />
    </FieldShell>
  )
}

export function TextAreaField({
  label,
  error,
  hint,
  optional,
  className,
  id,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} optional={optional} required={rest.required}>
      <textarea
        id={fieldId}
        className={cn('input min-h-24 resize-y', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...rest}
      />
    </FieldShell>
  )
}
