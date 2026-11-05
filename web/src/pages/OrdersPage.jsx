import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatINR } from '@/utils/money'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

const STATUS_TONE = {
  PLACED: 'warn',
  ACCEPTED: 'brand',
  PREPARING: 'brand',
  READY: 'brand',
  OUT_FOR_DELIVERY: 'warn',
  DELIVERED: 'veg',
  CANCELLED: 'neutral',
  REJECTED: 'neutral',
}

export function OrdersPage() {
  const { ready } = useRequireAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    ordersApi
      .mine({ limit: 30 })
      .then(({ orders: list }) => setOrders(list))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [ready])

  if (!ready || loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your past and active orders will show up here."
        actionLabel="Order now"
        onAction={() => (window.location.href = '/')}
      />
    )
  }

  return (
    <div className="container-app py-8 animate-rise">
      <h1 className="font-display text-4xl tracking-wide">Orders</h1>
      <div className="mt-6 space-y-3">
        {orders.map((order) => {
          const id = order._id || order.id
          const status = String(order.status || '').toUpperCase()
          return (
            <Link
              key={id}
              to={`/orders/${id}`}
              className="block rounded-2xl border border-line bg-surface p-4 transition hover:border-brand/30 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">
                    {order.restaurant?.name ||
                      order.restaurantName ||
                      'Restaurant order'}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[status] || 'neutral'}>{status || 'ORDER'}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted">
                  {(order.items || []).length} item
                  {(order.items || []).length === 1 ? '' : 's'}
                </span>
                <span className="font-bold">
                  {formatINR(
                    order.totalAmount ??
                      order.pricing?.totalPaise ??
                      order.grandTotal ??
                      0,
                  )}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
