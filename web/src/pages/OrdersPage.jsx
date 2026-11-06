import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, ArrowRight, Store } from 'lucide-react'
import { ordersApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatINRFromPaise } from '@/utils/money'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

const STATUS_TONE = {
  PLACED: 'warn',
  ACCEPTED: 'dark',
  CONFIRMED: 'dark',
  PREPARING: 'dark',
  READY_FOR_PICKUP: 'warn',
  READY: 'warn',
  OUT_FOR_DELIVERY: 'warn',
  DELIVERED: 'veg',
  CANCELLED: 'nonveg',
  REJECTED: 'nonveg',
}

export function OrdersPage() {
  const { ready } = useRequireAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    ordersApi
      .mine({ limit: 40 })
      .then(({ orders: list }) => setOrders(list || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [ready])

  if (!ready || loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="container-app py-16 animate-rise">
        <EmptyState
          title="No orders found"
          description="You haven't placed any orders yet. Discover our curated catalog and start shopping."
          actionLabel="Explore products"
          onAction={() => (window.location.href = '/categories')}
        />
      </div>
    )
  }

  return (
    <div className="container-app py-10 animate-rise">
      <div className="mb-8 border-b border-[#e7e5df] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
          Purchase History
        </span>
        <h1 className="mt-1 text-3xl font-black text-[#0a0a0a]">
          Your Orders ({orders.length})
        </h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const id = order._id || order.id
          const status = String(order.status || 'PLACED').toUpperCase()
          const totalPaise =
            order.totalAmount ??
            order.pricing?.totalPaise ??
            order.grandTotal ??
            0
          const itemsCount = (order.items || []).length

          return (
            <Link
              key={id}
              to={`/orders/${id}`}
              className="group block rounded-2xl border border-[#e7e5df] bg-white p-5 transition hover:border-[#0a0a0a] hover:shadow-sm sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-base text-[#0a0a0a]">
                      {order.restaurant?.name ||
                        order.vendor?.name ||
                        order.restaurantName ||
                        'Vendra Order'}
                    </p>
                    <Badge tone={STATUS_TONE[status] || 'neutral'}>
                      {status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <p className="mt-1 text-xs text-[#737069]">
                    Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} · ID: <span className="font-mono">{String(id).slice(-8)}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-left sm:text-right">
                    <p className="text-base font-black text-[#0a0a0a]">
                      {formatINRFromPaise(totalPaise)}
                    </p>
                    <p className="text-xs text-[#737069]">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="grid size-9 place-items-center rounded-xl bg-[#faf9f5] border border-[#e7e5df] group-hover:bg-[#0a0a0a] group-hover:text-white transition">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
