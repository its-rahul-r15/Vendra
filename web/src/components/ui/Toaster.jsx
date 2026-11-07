import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/utils/cn'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

/**
 * Luxury Floating Toast Notification
 * - Position: Top-Center (`top-6 left-1/2 -translate-x-1/2`)
 * - Minimal, ultra-clean pill geometry with smooth entry/exit
 * - High-end typography, subtle backdrop blur, and dismiss action
 */
export function Toaster() {
  const toasts = useUiStore((s) => s.toasts)
  const dismissToast = useUiStore((s) => s.dismissToast)

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed top-6 left-1/2 -translate-x-1/2 z-[99999] flex flex-col items-center gap-2.5 w-full max-w-md px-4">
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const isSuccess = toast.type === 'success'

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-center justify-between gap-3.5 rounded-full px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide shadow-2xl transition-all duration-300 animate-rise select-none',
              isError
                ? 'bg-[#180307]/95 text-white border border-red-500/30 shadow-[0_10px_30px_rgba(239,68,68,0.2)]'
                : 'bg-[#120b0d]/95 text-white border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md',
            )}
          >
            {/* Minimal Icon Status Indicator */}
            <div className="flex items-center gap-2.5">
              {isError ? (
                <AlertCircle className="size-4 text-rose-400 shrink-0" />
              ) : isSuccess ? (
                <div className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0" />
              ) : (
                <div className="size-2 rounded-full bg-white/70 shrink-0" />
              )}
              <span className="leading-snug text-left">{toast.message}</span>
            </div>

            {/* Quick Dismiss Button */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="size-5 rounded-full hover:bg-white/10 text-white/60 hover:text-white grid place-items-center transition cursor-pointer ml-2 shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="size-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
