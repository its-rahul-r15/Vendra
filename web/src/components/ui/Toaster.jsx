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
            'pointer-events-auto rounded-xl border px-5 py-3 text-sm font-medium shadow-xl animate-rise',
            toast.type === 'error' && 'bg-[#b82828] border-[#b82828] text-white',
            toast.type === 'success' && 'bg-[#0a0a0a] border-[#0a0a0a] text-white',
            toast.type === 'info' && 'bg-[#0a0a0a] border-[#e7e5df] text-white',
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
