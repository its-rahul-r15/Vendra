import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Store,
  Truck,
  XCircle,
} from 'lucide-react'
import { ordersApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed' },
  { key: 'ACCEPTED', label: 'Accepted by Merchant' },
  { key: 'PREPARING', label: 'Packaging / In Prep' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
]

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { ready } = useRequireAuth()
  const toast = useUiStore((s) => s.toast)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    if (!ready) return
    let active = true

    ordersApi
      .get(id)
      .then(({ order: ord }) => {
        if (active) setOrder(ord)
      })
      .catch((err) => {
        if (active) toast(err.message, 'error')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, ready, toast])

  if (!ready || loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Order not found"
          description="Could not locate this order in your purchase records."
          actionLabel="View all orders"
          onAction={() => navigate('/orders')}
        />
      </div>
    )
  }

  const status = String(order.status || 'PLACED').toUpperCase()
  const isCancelled = status === 'CANCELLED' || status === 'REJECTED'
  const isDelivered = status === 'DELIVERED'
  const canCancel = ['PLACED', 'PAYMENT_PENDING', 'CONFIRMED'].includes(status)

  const totalPaise =
    order.totalAmount ??
    order.pricing?.totalPaise ??
    order.grandTotal ??
    0
  const subtotalPaise =
    order.subtotal ??
    order.pricing?.subtotalPaise ??
    (order.items || []).reduce((s, i) => s + (Number(i.pricePaise) || (i.price ? i.price * 100 : 0)) * (i.quantity || 1), 0)
  const deliveryPaise = order.deliveryFeePaise || order.fees?.deliveryFeePaise || 4000
  const platformPaise = order.platformFeePaise || order.fees?.platformFeePaise || 1000
  const discountPaise = order.discountAmount || order.pricing?.discountPaise || 0

  async function handleCancelOrder() {
    setCancelling(true)
    try {
      await ordersApi.cancel(id, {
        cancellationReason: cancelReason.trim() || 'Cancelled by customer',
      })
      toast('Order cancelled successfully', 'info')
      setShowCancelModal(false)
      // Refresh order details
      const res = await ordersApi.get(id)
      setOrder(res.order)
    } catch (err) {
      toast(err.message || 'Could not cancel order', 'error')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="container-app max-w-4xl py-10 animate-rise">
      <Link
        to="/orders"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#737069] hover:text-[#0a0a0a]"
      >
        <ArrowLeft className="size-4" /> Back to Orders
      </Link>

      <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-10 shadow-sm">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e7e5df] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
              Order #{String(id).slice(-8)}
            </span>
            <h1 className="mt-1 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
              {order.restaurant?.name || order.vendor?.name || 'Vendra Storefront'}
            </h1>
            <p className="mt-1 text-xs text-[#737069]">
              Placed on {new Date(order.createdAt || Date.now()).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge tone={isCancelled ? 'nonveg' : isDelivered ? 'veg' : 'warn'}>
              {status.replace(/_/g, ' ')}
            </Badge>

            {canCancel ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-xs border-[#b82828] text-[#b82828] hover:bg-[#b82828] hover:text-white"
              >
                Cancel Order
              </Button>
            ) : null}
          </div>
        </div>

        {/* Live Status Tracker */}
        <div className="my-8 rounded-2xl bg-[#faf9f5] border border-[#e7e5df] p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#737069] mb-4">
            Live Order Status
          </h2>

          {isCancelled ? (
            <div className="flex items-center gap-3 text-[#b82828]">
              <XCircle className="size-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Order Cancelled</p>
                <p className="text-xs text-[#737069]">
                  {order.cancellationReason || 'This order was cancelled.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status)
                const isPassed = currentIdx >= idx
                const isCurrent = step.key === status

                return (
                  <div
                    key={step.key}
                    className={`rounded-xl border p-3 text-center transition ${
                      isCurrent
                        ? 'border-[#0a0a0a] bg-white font-bold text-[#0a0a0a] shadow-sm'
                        : isPassed
                        ? 'border-[#e7e5df] bg-white text-[#0a0a0a]'
                        : 'border-transparent text-[#99958d]'
                    }`}
                  >
                    <div className="mx-auto mb-2 grid size-7 place-items-center rounded-full bg-[#faf9f5] text-xs">
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <p className="text-xs leading-snug">{step.label}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Order Items Table */}
        <div className="border-t border-[#e7e5df] pt-6">
          <h2 className="text-base font-bold text-[#0a0a0a] mb-4">
            Items in this Order ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-[#e7e5df]">
            {(order.items || []).map((item, idx) => {
              const name = item.name || item.menuItem?.name || 'Item'
              const qty = item.quantity || 1
              const rawPrice = item.pricePaise || item.price || 0
              const pricePaise = rawPrice > 1000 ? rawPrice : rawPrice * 100

              return (
                <div key={idx} className="flex items-center justify-between py-3.5">
                  <div>
                    <p className="font-bold text-sm text-[#0a0a0a]">{name}</p>
                    <p className="text-xs text-[#737069]">
                      Qty: {qty} × {formatINRFromPaise(pricePaise)}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-[#0a0a0a]">
                    {formatINRFromPaise(pricePaise * qty)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Delivery Address & Fee Breakdown */}
        <div className="mt-8 grid gap-6 border-t border-[#e7e5df] pt-6 sm:grid-cols-2">
          {/* Address */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#737069] mb-2 flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Delivery Address
            </h3>
            <p className="text-sm text-[#575550]">
              {order.deliveryAddress?.line1 || order.deliveryAddress?.street || 'Customer Address'}
              {order.deliveryAddress?.line2 ? `, ${order.deliveryAddress?.line2}` : ''}
              <br />
              {order.deliveryAddress?.city}, {order.deliveryAddress?.state} —{' '}
              {order.deliveryAddress?.pincode || order.deliveryAddress?.postalCode}
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl bg-[#faf9f5] border border-[#e7e5df] p-4 text-xs space-y-2">
            <div className="flex justify-between text-[#575550]">
              <span>Items Total</span>
              <span className="font-semibold">{formatINRFromPaise(subtotalPaise)}</span>
            </div>
            <div className="flex justify-between text-[#575550]">
              <span>Delivery Fee</span>
              <span className="font-semibold">{formatINRFromPaise(deliveryPaise)}</span>
            </div>
            <div className="flex justify-between text-[#575550]">
              <span>Platform Fee</span>
              <span className="font-semibold">{formatINRFromPaise(platformPaise)}</span>
            </div>
            {discountPaise > 0 ? (
              <div className="flex justify-between text-[#1e7041]">
                <span>Discount</span>
                <span className="font-semibold">-{formatINRFromPaise(discountPaise)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-[#e7e5df] pt-2 text-sm font-black text-[#0a0a0a]">
              <span>Total Paid / Payable</span>
              <span>{formatINRFromPaise(totalPaise)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-rise">
            <h3 className="text-lg font-bold text-[#0a0a0a]">Cancel Order</h3>
            <p className="mt-1 text-xs text-[#737069]">
              Are you sure you want to cancel this order? Please tell us why.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Ordered by mistake, wrong address, changed mind"
              rows={3}
              className="mt-4 w-full rounded-xl border border-[#e7e5df] p-3 text-sm text-[#121212] outline-none focus:border-[#0a0a0a]"
            />

            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
              >
                Keep Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="bg-[#b82828] border-[#b82828] hover:bg-[#991b1b]"
              >
                {cancelling ? 'Cancelling…' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
