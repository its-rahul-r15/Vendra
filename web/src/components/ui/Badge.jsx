import { cn } from '@/utils/cn'

const tones = {
  brand: 'bg-[#121212] text-white',
  dark: 'bg-[#121212] text-white',
  neutral: 'bg-[#f4f2ec] text-[#42403c] border border-[#e7e5df]',
  veg: 'bg-[#edf7ed] text-[#1e7041] border border-[#c8e6c9]',
  nonveg: 'bg-[#fdeeed] text-[#b82828] border border-[#ffcdd2]',
  warn: 'bg-[#fff8e1] text-[#8d6e15] border border-[#ffe082]',
  subtle: 'bg-white text-[#121212] border border-[#e7e5df]',
  accent: 'bg-[#faf4ea] text-[#a37237] border border-[#eddcc4]',
}

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase',
        tones[tone] || tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  )
}
