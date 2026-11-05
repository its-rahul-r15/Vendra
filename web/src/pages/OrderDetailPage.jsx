import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ordersApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useUiStore } from '@/stores/ui.store'
import { formatINR } from '@/utils/money'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ready } = useRequireAuth()
  const toast = useUiStore((s) => s.toast)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!ready) return
    ordersApi
      .get(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [ready, id])

  if (!ready || loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!order) {
    return (
      <EmptyState
        title="Order not found"
        actionLabel="Back to orders"
        onAction={() => navigate('/orders')}
      />
    )
  }

  const status = String(order.status || '').toUpperCase()
  const canCancel = ['PLACED', 'PENDING', 'ACCEPTED'].includes(status)

  async function cancel() {
    setCancelling(true)
    try {
      const updated = await ordersApi.cancel(id, { reason: 'Cancelled by customer' })
      setOrder(updated)
      toast('Order cancelled', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container-app max-w-2xl py-8 animate-rise">
      <Link to="/orders" className="text-sm font-semibold text-brand">
        ← All orders
      </Link>

      <div className="mt-4 rounded-3xl border border-line noise-panel p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl tracking-wide">
              {order.restaurant?.name || 'Order'}
            </h1>
            <p className="mt-1 text-sm text-muted">#{String(order._id || id).slice(-8)}</p>
          </div>
          <Badge tone={status === 'DELIVERED' ? 'veg' : 'brand'}>{status}</Badge>
        </div>

        <div className="mt-6 divide-y divide-line">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="flex justify-between gap-3 py-3 text-sm">
              <span className="font-semibold text-ink">
                {item.quantity}× {item.name || item.menuItem?.name || 'Item'}
              </span>
              <span className="text-muted">
                {formatINR((item.price || 0) * (item.quantity || 1))}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-bold">
          <span>Total</span>
          <span>
            {formatINR(
              order.totalAmount ?? order.pricing?.totalPaise ?? order.grandTotal ?? 0,
            )}
          </span>
        </div>

        {order.deliveryAddress ? (
          <div className="mt-5 rounded-2xl bg-paper p-4 text-sm">
            <p className="font-bold text-ink">Deliver to</p>
            <p className="mt-1 text-muted">
              {order.deliveryAddress.line1}
              {order.deliveryAddress.line2 ? `, ${order.deliveryAddress.line2}` : ''},{' '}
              {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
            </p>
          </div>
        ) : null}

        {canCancel ? (
          <Button
            variant="outline"
            className="mt-5 w-full border-nonveg/30 text-nonveg hover:bg-nonveg hover:text-white"
            disabled={cancelling}
            onClick={cancel}
          >
            {cancelling ? 'Cancelling…' : 'Cancel order'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
