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
  Sparkles,
  Truck,
} from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { useAuthStore } from '@/stores/auth.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartPage() {
  const navigate = useNavigate()
  const cart = useCartStore((s) => s.cart)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const user = useAuthStore((s) => s.user)

  const items = cart?.items || []
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.pricePaise) || 0) * (item.quantity || 1),
    0,
  )

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-20 flex items-center justify-center">
        <div className="container-app max-w-xl text-center space-y-4">
          <div className="size-16 rounded-2xl bg-white border border-black/10 mx-auto flex items-center justify-center shadow-xs">
            <ShoppingBag className="size-7 text-[#120b0d]" />
          </div>
          <h1 className="text-2xl font-black text-[#120b0d] tracking-tight">Your shopping bag is empty</h1>
          <p className="text-xs text-[#736c6e] max-w-md mx-auto">
            Discover verified creators and authentic marketplace products in our catalog.
          </p>
          <div className="pt-2">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-xl bg-[#120b0d] hover:bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <span>Start Shopping</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#120b0d] py-10 sm:py-14 animate-rise">
      <div className="container-app max-w-6xl">
        
        {/* Header Breadcrumb */}
        <div className="pb-8 border-b border-black/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#990024]">
              Shopping Bag
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#120b0d] tracking-tight mt-0.5">
              Review Your Cart
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#736c6e] font-semibold hidden sm:inline-block">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            <button
              onClick={clearCart}
              className="text-xs font-bold text-[#8c8587] hover:text-rose-600 transition cursor-pointer"
            >
              Clear Bag
            </button>
          </div>
        </div>

        {/* 2-Column Balanced Cart Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-white border border-black/[0.08] p-6 sm:p-8 space-y-4">
            {items.map((item) => {
              const id = item.listingId || item.id
              const itemTotal = (Number(item.pricePaise) || 0) * (item.quantity || 1)
              return (
                <div
                  key={id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#faf9f7] border border-black/5 hover:border-black/15 transition"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4">
                    <div className="size-18 shrink-0 overflow-hidden rounded-xl bg-white border border-black/10 p-1">
                      <img
                        src={resolveImage(item.image)}
                        alt={item.name}
                        className="size-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#990024] block">
                        {item.vendorName || 'Verified Seller'}
                      </span>
                      <h3 className="text-sm font-bold text-[#120b0d] line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#736c6e]">
                        {formatINRFromPaise(item.pricePaise || 0)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Item Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                    {/* Stepper */}
                    <div className="flex h-8 items-center gap-2 rounded-lg bg-white border border-black/15 px-2 text-[#120b0d]">
                      <button
                        onClick={() => setQuantity(id, item.quantity - 1)}
                        className="grid size-5 place-items-center rounded hover:bg-black/5 transition cursor-pointer"
                        aria-label="Decrease"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="min-w-4 text-center text-xs font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(id, item.quantity + 1)}
                        className="grid size-5 place-items-center rounded hover:bg-black/5 transition cursor-pointer"
                        aria-label="Increase"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <span className="text-sm font-black text-[#120b0d] min-w-18 text-right">
                      {formatINRFromPaise(itemTotal)}
                    </span>

                    <button
                      onClick={() => removeItem(id)}
                      className="size-7 rounded text-[#8c8587] hover:text-rose-600 grid place-items-center transition cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}

            <div className="pt-4 flex items-center justify-between">
              <Link
                to="/categories"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#736c6e] hover:text-[#120b0d] transition"
              >
                <ArrowLeft className="size-3.5" /> Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-white border border-black/[0.08] p-6 sm:p-7 space-y-6">
            <h2 className="text-base font-black text-[#120b0d] tracking-tight pb-3 border-b border-black/[0.06]">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs font-medium text-[#736c6e]">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-[#120b0d]">
                  {formatINRFromPaise(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Express Shipping</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                  FREE
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes (GST)</span>
                <span className="font-bold text-[#120b0d]">Included</span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#736c6e] uppercase tracking-wider">Total</span>
              <span className="text-xl font-black text-[#120b0d]">
                {formatINRFromPaise(subtotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#120b0d] hover:bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-3.5" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-semibold text-[#8c8587]">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Certified 256-bit encrypted checkout</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
