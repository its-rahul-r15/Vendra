import { cn } from '@/utils/cn'

export function Badge({ children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-black/5 text-ink-soft',
    brand: 'bg-brand text-white',
    veg: 'bg-veg/10 text-veg',
    warn: 'bg-ember/15 text-ember',
    dark: 'bg-ink text-white',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
