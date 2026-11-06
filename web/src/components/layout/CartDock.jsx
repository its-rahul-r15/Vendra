import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatINRFromPaise } from '@/utils/money'

export function CartDock() {
  const cart = useCartStore((s) => s.cart)
  const itemCount = useCartStore((s) => s.itemCount)

  if (!itemCount) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 px-4 md:bottom-7">
      <Link
        to="/cart"
        className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between rounded-2xl bg-[#0a0a0a] px-5 py-3.5 text-white shadow-2xl transition hover:bg-[#1a1a1a] animate-rise"
      >
        <div className="flex items-center gap-3.5">
          <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-white">
            <ShoppingBag className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in Bag
            </p>
            <p className="text-xs text-white/70">
              {formatINRFromPaise(cart.subtotal || 0)}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-medium text-white underline underline-offset-4">
          <span>Checkout</span>
          <ArrowRight className="size-4" />
        </span>
      </Link>
    </div>
  )
}
