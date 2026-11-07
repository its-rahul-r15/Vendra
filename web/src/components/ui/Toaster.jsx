import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/utils/cn'

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts)

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed top-20 right-6 z-[9999] flex flex-col items-end gap-2.5 max-w-sm sm:max-w-md animate-rise">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md tracking-wide transition-all duration-300 ring-1',
            toast.type === 'error' && 'bg-[#990024] text-white shadow-red-950/40 ring-white/20',
            toast.type === 'success' && 'bg-[#120b0d]/95 text-white shadow-black/40 ring-white/15',
            toast.type === 'info' && 'bg-[#120b0d]/95 text-white shadow-black/40 ring-white/15',
          )}
        >
          <span className="size-2 rounded-full bg-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
