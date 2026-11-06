import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight, Store } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartPage() {
  const navigate = useNavigate()
  const cart = useCartStore((state) => state.cart)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clear = useCartStore((state) => state.clear)

  if (!cart.items.length) {
    return (
      <div className="container-app py-16 animate-rise">
        <EmptyState
          title="Your shopping cart is empty"
          description="Explore our curated departments or discover local verified storefronts."
          actionLabel="Explore catalog"
          onAction={() => navigate('/categories')}
        />
      </div>
    )
  }

  return (
    <div className="container-app grid gap-8 py-10 lg:grid-cols-[1.3fr_0.7fr] animate-rise">
      {/* Cart Items Column */}
      <section className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between border-b border-[#e7e5df] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
              Bag Overview
            </span>
            <h1 className="mt-1 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
              Shopping Cart
            </h1>
          </div>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-[#737069] transition hover:text-[#b82828] underline"
          >
            Clear all
          </button>
        </div>

        {cart.vendorName ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#faf9f5] border border-[#e7e5df] px-3.5 py-2 text-xs font-semibold text-[#121212]">
            <Store className="size-3.5 text-[#0a0a0a]" />
            <span>Fulfilling Vendor: {cart.vendorName}</span>
          </div>
        ) : null}

        <div className="divide-y divide-[#e7e5df]">
          {cart.items.map((item) => {
            const itemId = item.id || item.listingId || item.menuItemId
            const itemTotal = (Number(item.pricePaise) || 0) * (item.quantity || 1)

            return (
              <div
                key={itemId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[#faf9f5] border border-[#e7e5df]">
                    <img
                      src={resolveImage(item.image)}
                      alt={item.name}
                      className="size-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-base font-bold text-[#0a0a0a]">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#737069]">
                      {formatINRFromPaise(item.pricePaise || 0)} · {item.unit || 'unit'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  {/* Quantity controls */}
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-[#121212] bg-[#faf9f5] px-2 text-[#0a0a0a]">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(itemId, item.quantity - 1)}
                      className="grid size-6 place-items-center rounded hover:bg-black/5"
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="size-3.5 text-[#b82828]" />
                      ) : (
                        <Minus className="size-3.5" />
                      )}
                    </button>
                    <span className="min-w-5 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(itemId, item.quantity + 1)}
                      className="grid size-6 place-items-center rounded hover:bg-black/5"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>

                  {/* Total for this line */}
                  <div className="min-w-24 text-right">
                    <p className="text-base font-bold text-[#0a0a0a]">
                      {formatINRFromPaise(itemTotal)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 border-t border-[#e7e5df] pt-6 flex justify-between items-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a0a0a] hover:underline"
          >
            <span>← Continue Category Shopping</span>
          </Link>
          <Link
            to="/shops"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#737069] hover:underline"
          >
            <span>Browse Other Stores</span>
          </Link>
        </div>
      </section>

      {/* Summary Column */}
      <aside className="h-fit rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-black text-[#0a0a0a]">Order Summary</h2>

        <div className="mt-6 space-y-3 border-b border-[#e7e5df] pb-6 text-sm">
          <div className="flex justify-between text-[#575550]">
            <span>Items Subtotal</span>
            <span className="font-semibold text-[#0a0a0a]">
              {formatINRFromPaise(cart.subtotal || 0)}
            </span>
          </div>
          <div className="flex justify-between text-[#575550]">
            <span>Estimated Shipping</span>
            <span className="font-semibold text-[#0a0a0a]">Calculated at Checkout</span>
          </div>
          <div className="flex justify-between text-[#575550]">
            <span>Applicable Taxes</span>
            <span className="font-semibold text-[#0a0a0a]">Included</span>
          </div>
        </div>

        <div className="mt-5 flex justify-between text-lg font-black text-[#0a0a0a]">
          <span>Total (Pre-fee)</span>
          <span>{formatINRFromPaise(cart.subtotal || 0)}</span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/checkout')}
          className="mt-6 w-full h-12 text-base font-semibold"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="size-4" />
        </Button>

        <p className="mt-4 text-center text-xs text-[#737069]">
          Secure checkout · Free cancellation before dispatch
        </p>
      </aside>
    </div>
  )
}
