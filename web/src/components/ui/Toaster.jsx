import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/utils/cn'

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts)

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg animate-rise',
            toast.type === 'error' && 'bg-nonveg',
            toast.type === 'success' && 'bg-veg',
            toast.type === 'info' && 'bg-ink',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
