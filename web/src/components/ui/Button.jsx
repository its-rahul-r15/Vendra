import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-md shadow-red-600/20 font-bold',
  secondary:
    'bg-[#f3f4f6] text-[#111827] hover:bg-[#e5e7eb] font-bold',
  outline:
    'bg-white text-[#111827] hover:bg-[#fef2f2] hover:text-[#dc2626] shadow-xs font-bold',
  soft:
    'bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] font-bold',
  danger:
    'bg-[#dc2626] text-white hover:bg-[#b91c1c] font-bold',
  ghost:
    'bg-transparent text-[#111827] hover:bg-[#f3f4f6] font-bold',
}

const sizes = {
  sm: 'h-9 px-4 text-xs rounded-xl',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-13 px-7 text-base rounded-2xl',
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
        'inline-flex items-center justify-center gap-2 transition duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer select-none',
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
