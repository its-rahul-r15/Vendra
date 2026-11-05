import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatINR } from '@/utils/money'
import { itemImage } from '@/utils/media'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartPage() {
  const { ready } = useRequireAuth()
  const navigate = useNavigate()
  const cart = useCartStore((s) => s.cart)
  const loading = useCartStore((s) => s.loading)
  const refresh = useCartStore((s) => s.refresh)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const clear = useCartStore((s) => s.clear)
  const toast = useUiStore((s) => s.toast)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (ready) refresh().catch(() => {})
  }, [ready, refresh])

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  const items = cart?.items || []

  if (!items.length) {
    return (
      <EmptyState
        title="Cart is empty"
        description="Add something delicious from a nearby kitchen."
        actionLabel="Browse restaurants"
        onAction={() => navigate('/')}
      />
    )
  }

  return (
    <div className="container-app grid gap-8 py-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-3xl border border-line noise-panel p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="font-display text-4xl tracking-wide">Your cart</h1>
          <button
            type="button"
            className="text-sm font-semibold text-muted hover:text-nonveg"
            onClick={async () => {
              await clear()
              toast('Cart cleared', 'info')
            }}
          >
            Clear all
          </button>
        </div>

        <div className="divide-y divide-line">
          {items.map((item) => {
            const id = String(
              item.menuItem?._id || item.menuItem || item.menuItemId || item._id,
            )
            const name = item.name || item.menuItem?.name || 'Item'
            const price = item.price ?? item.menuItem?.price ?? 0
            return (
              <div key={id} className="flex items-center gap-4 py-4">
                <img
                  src={itemImage(item.menuItem || item)}
                  alt=""
                  className="size-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{name}</p>
                  <p className="mt-1 text-sm text-muted">{formatINR(price)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-2 text-brand">
                  <button
                    type="button"
                    className="grid size-8 place-items-center"
                    disabled={loading}
                    onClick={() =>
                      setQuantity(id, (item.quantity || 1) - 1).catch((e) =>
                        toast(e.message, 'error'),
                      )
                    }
                  >
                    {(item.quantity || 1) <= 1 ? (
                      <Trash2 className="size-4" />
                    ) : (
                      <Minus className="size-4" />
                    )}
                  </button>
                  <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    className="grid size-8 place-items-center"
                    disabled={loading}
                    onClick={() =>
                      setQuantity(id, (item.quantity || 0) + 1).catch((e) =>
                        toast(e.message, 'error'),
                      )
                    }
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <aside className="h-fit rounded-3xl border border-line bg-surface p-5 shadow-[0_16px_40px_rgba(20,20,20,0.05)] md:p-6">
        <h2 className="text-lg font-bold">Bill summary</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Item total</span>
            <span className="font-semibold">{formatINR(cart.subtotal || 0)}</span>
          </div>
          <p className="text-xs text-muted">
            Taxes & delivery calculated at checkout.
          </p>
        </div>
        <Button
          className="mt-6 w-full"
          onClick={() => navigate('/checkout')}
          disabled={!user}
        >
          Proceed to checkout
        </Button>
        <Link to="/" className="mt-3 block text-center text-sm font-semibold text-brand">
          Add more items
        </Link>
      </aside>
    </div>
  )
}
