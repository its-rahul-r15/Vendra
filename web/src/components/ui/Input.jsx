import { cn } from '@/utils/cn'

export function Input({ className, label, hint, error, ...props }) {
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-semibold text-ink-soft">{label}</span>
      ) : null}
      <input
        className={cn(
          'h-12 w-full rounded-xl border border-line bg-surface px-3.5 text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10',
          error && 'border-nonveg focus:border-nonveg focus:ring-nonveg/10',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-nonveg">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
}
