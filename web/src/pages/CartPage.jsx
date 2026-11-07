import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Store,
} from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartPage() {
  const navigate = useNavigate()
  const cart = useCartStore((s) => s.cart)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const user = useAuthStore((s) => s.user)

  const items = cart?.items || []

  if (items.length === 0) {
    return (
      <div className="container-app py-16 animate-rise">
        <EmptyState
          title="Your shopping cart is empty"
          description="Explore our independent shops and curated catalog to add items to your cart."
          actionLabel="Start Shopping"
          onAction={() => navigate('/categories')}
        />
      </div>
    )
  }

  return (
    <div className="container-app py-10 animate-rise">
      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-8 rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111827]">
                Shopping Cart
              </h1>
              <p className="text-xs text-[#6b7280] font-medium mt-0.5">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <button
              onClick={clearCart}
              className="text-xs font-bold text-[#dc2626] hover:underline cursor-pointer"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const id = item.listingId || item.id
              return (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#f9fafb]"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-white p-1">
                      <img
                        src={resolveImage(item.image)}
                        alt={item.name}
                        className="size-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#111827] line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#6b7280] mt-0.5">
                        {formatINRFromPaise(item.pricePaise || 0)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    {/* Quantity Selector */}
                    <div className="flex h-9 items-center gap-2 rounded-xl bg-white px-2 shadow-2xs text-[#dc2626]">
                      <button
                        onClick={() => setQuantity(id, item.quantity - 1)}
                        className="grid size-6 place-items-center rounded hover:bg-[#fef2f2] transition"
                        aria-label="Decrease"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-4 text-center text-xs font-black text-[#111827]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(id, item.quantity + 1)}
                        className="grid size-6 place-items-center rounded hover:bg-[#fef2f2] transition"
                        aria-label="Increase"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <span className="text-sm sm:text-base font-black text-[#111827]">
                      {formatINRFromPaise((item.pricePaise || 0) * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeItem(id)}
                      className="text-[#9ca3af] hover:text-[#dc2626] transition cursor-pointer p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 pt-4 flex items-center justify-between">
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#dc2626] hover:underline"
            >
              <ArrowLeft className="size-3.5" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 rounded-3xl bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#111827]">Order Summary</h2>

          <div className="space-y-3 text-xs sm:text-sm font-medium text-[#4b5563]">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-bold text-[#111827]">
                {formatINRFromPaise(cart?.itemTotalPaise || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Estimate</span>
              <span className="font-bold text-[#16a34a]">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span className="font-bold text-[#111827]">Included</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between text-base sm:text-lg font-black text-[#111827]">
            <span>Total Payable</span>
            <span>{formatINRFromPaise(cart?.grandTotalPaise || cart?.itemTotalPaise || 0)}</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/checkout')}
            className="w-full justify-center"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="size-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#6b7280]">
            <ShieldCheck className="size-4 text-[#dc2626]" />
            <span>Secure 256-bit encrypted checkout</span>
          </div>
        </div>
      </div>
    </div>
  )
}
