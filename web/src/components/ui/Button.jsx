import { cn } from '@/utils/cn'

const variants = {
  primary:
    'bg-[#0a0a0a] text-white hover:bg-[#262626] shadow-[0_2px_8px_rgba(0,0,0,0.12)] border border-[#0a0a0a]',
  secondary:
    'bg-white text-[#121212] hover:bg-[#faf9f5] border border-[#121212] shadow-sm',
  outline:
    'border border-[#e7e5df] bg-white text-[#121212] hover:border-[#121212] hover:bg-[#faf9f5]',
  ghost:
    'bg-transparent text-[#121212] hover:bg-black/[0.05]',
  warm:
    'bg-[#f4f2ec] text-[#121212] hover:bg-[#e8e6df] border border-[#e7e5df]',
  dark:
    'bg-[#141414] text-white hover:bg-black',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm font-medium',
  md: 'h-11 px-5 text-base font-medium',
  lg: 'h-13 px-7 text-base font-semibold',
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
        'inline-flex items-center justify-center gap-2 rounded-xl transition duration-150 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
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
