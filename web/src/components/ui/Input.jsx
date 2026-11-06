import { cn } from '@/utils/cn'

export function Input({ className, label, hint, error, required, id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="space-y-1.5 text-left">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#2d2b27]">
          {label} {required ? <span className="text-[#b82828]">*</span> : null}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'h-12 w-full rounded-xl border border-[#e7e5df] bg-white px-4 text-base text-[#121212] outline-none transition duration-150 placeholder:text-[#99958d] focus:border-[#121212] focus:ring-1 focus:ring-[#121212]',
          error && 'border-[#b82828] focus:border-[#b82828] focus:ring-[#b82828]',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-[#b82828] animate-rise">{error}</p>
      ) : null}
      {!error && hint ? (
        <p className="text-xs text-[#737069]">{hint}</p>
      ) : null}
    </div>
  )
}
