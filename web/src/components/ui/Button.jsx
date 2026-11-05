import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-brand text-white hover:bg-brand-dark shadow-[0_8px_20px_rgba(227,28,35,0.28)]',
  secondary:
    'bg-ink text-white hover:bg-black',
  outline:
    'border border-line bg-surface text-ink hover:border-brand/40 hover:text-brand',
  ghost: 'bg-transparent text-ink hover:bg-black/5',
  soft: 'bg-brand/10 text-brand hover:bg-brand/15',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

export function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) {
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  )
}
