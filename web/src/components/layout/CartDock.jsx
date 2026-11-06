import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatINRFromPaise } from '@/utils/money'

export function CartDock() {
  const cart = useCartStore((s) => s.cart)
  const itemCount = useCartStore((s) => s.itemCount)

  if (!itemCount) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 md:bottom-6">
      <Link
        to="/cart"
        className="pointer-events-auto mx-auto flex w-full max-w-lg items-center justify-between rounded-2xl bg-ink px-4 py-3 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] animate-rise"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand">
            <ShoppingBag className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">
              {itemCount} item{itemCount > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-white/65">{formatINRFromPaise(cart.subtotal || 0)}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-ember">View cart →</span>
      </Link>
    </div>
  )
}
