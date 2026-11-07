import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatINRFromPaise } from '@/utils/money'

export function CartDock() {
  const cart = useCartStore((s) => s.cart)
  const itemCount = useCartStore((s) => s.itemCount)
  const [dismissed, setDismissed] = useState(false)

  // Reset dismissed state whenever itemCount changes (e.g. user adds another item)
  useEffect(() => {
    setDismissed(false)
  }, [itemCount])

  if (!itemCount || dismissed) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 px-4 md:bottom-7">
      <div className="pointer-events-auto mx-auto flex w-full max-w-md items-center justify-between rounded-full bg-[#120b0d]/95 backdrop-blur-md px-5 py-3 text-white shadow-2xl ring-1 ring-white/10 transition-all hover:bg-[#120b0d] animate-rise">
        
        {/* Cart Link Area */}
        <Link
          to="/cart"
          className="flex flex-1 items-center justify-between pr-3 group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-white/15 text-white group-hover:scale-105 transition-transform">
              <ShoppingBag className="size-4" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in Bag
              </p>
              <p className="text-[11px] text-white/70 font-semibold mt-0.5">
                {formatINRFromPaise(cart.subtotal || 0)}
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#f59e0b] group-hover:underline">
            <span>Checkout</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>

        {/* Dismiss Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
          }}
          className="ml-2 grid size-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition cursor-pointer shrink-0"
          title="Dismiss dock"
          aria-label="Dismiss dock"
        >
          <X className="size-3.5" />
        </button>

      </div>
    </div>
  )
}
