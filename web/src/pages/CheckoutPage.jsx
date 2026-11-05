import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ordersApi, couponsApi, usersApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINR } from '@/utils/money'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function CheckoutPage() {
  const { ready, user } = useRequireAuth()
  const navigate = useNavigate()
  const cart = useCartStore((s) => s.cart)
  const refreshCart = useCartStore((s) => s.refresh)
  const clearCart = useCartStore((s) => s.clear)
  const toast = useUiStore((s) => s.toast)

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [instructions, setInstructions] = useState('')
  const [fees, setFees] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  })

  useEffect(() => {
    if (!ready) return
    Promise.all([refreshCart(), usersApi.addresses(), ordersApi.fees()])
      .then(([_, addrs, feeConfig]) => {
        setAddresses(addrs)
        setSelectedAddress(addrs.find((a) => a.isDefault) || addrs[0] || null)
        setFees(feeConfig)
      })
      .catch((err) => toast(err.message, 'error'))
  }, [ready, refreshCart, toast])

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!(cart?.items || []).length) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Your cart is empty."
        actionLabel="Go home"
        onAction={() => navigate('/')}
      />
    )
  }

  async function applyCoupon() {
    try {
      const result = await couponsApi.validate({
        code: couponCode.trim(),
        cartTotal: cart.subtotal,
        restaurantId: cart.restaurantId || cart.restaurant?._id,
      })
      setDiscount(result.discountAmount || 0)
      toast('Coupon applied', 'success')
    } catch (err) {
      setDiscount(0)
      toast(err.message, 'error')
    }
  }

  async function saveAddress(e) {
    e.preventDefault()
    try {
      const address = await usersApi.addAddress(addressForm)
      setAddresses((prev) => [...prev, address])
      setSelectedAddress(address)
      setShowAddressForm(false)
      toast('Address saved', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function placeOrder() {
    if (!selectedAddress) {
      toast('Add a delivery address', 'error')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        paymentMethod,
        couponCode: couponCode.trim() || undefined,
        deliveryInstructions: instructions || undefined,
        deliveryAddress: {
          line1: selectedAddress.line1,
          line2: selectedAddress.line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          location: selectedAddress.location,
        },
        restaurantId: cart.restaurantId || cart.restaurant?._id,
      }

      const result = await ordersApi.place(payload)
      await clearCart()
      const orderId = result?.order?._id || result?.order?.id
      toast('Order placed', 'success')
      navigate(orderId ? `/orders/${orderId}` : '/orders')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const deliveryFee =
    fees?.deliveryFeePaise != null
      ? fees.deliveryFeePaise / 100
      : fees?.deliveryFee || 0

  return (
    <div className="container-app grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-5">
        <section className="rounded-3xl border border-line noise-panel p-5 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl tracking-wide">Delivery address</h1>
            <button
              type="button"
              className="text-sm font-bold text-brand"
              onClick={() => setShowAddressForm((v) => !v)}
            >
              {showAddressForm ? 'Cancel' : 'Add new'}
            </button>
          </div>

          {showAddressForm ? (
            <form onSubmit={saveAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input
                label="Label"
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
              />
              <Input
                label="Pincode"
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  label="Address line"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  required
                />
              </div>
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                required
              />
              <Input
                label="State"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                required
              />
              <Button type="submit" className="sm:col-span-2">
                Save address
              </Button>
            </form>
          ) : null}

          <div className="mt-4 space-y-3">
            {addresses.map((address) => {
              const aid = address._id || address.id
              const selected = (selectedAddress?._id || selectedAddress?.id) === aid
              return (
                <button
                  key={aid}
                  type="button"
                  onClick={() => setSelectedAddress(address)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected
                      ? 'border-brand bg-brand/5'
                      : 'border-line hover:border-brand/30'
                  }`}
                >
                  <p className="font-bold text-ink">{address.label || 'Address'}</p>
                  <p className="mt-1 text-sm text-muted">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}, {address.city},{' '}
                    {address.state} — {address.pincode}
                  </p>
                </button>
              )
            })}
            {!addresses.length && !showAddressForm ? (
              <p className="text-sm text-muted">No saved addresses yet.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5 md:p-6">
          <h2 className="text-lg font-bold">Payment</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {['COD', 'ONLINE'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                  paymentMethod === method
                    ? 'border-brand bg-brand/5 text-brand'
                    : 'border-line'
                }`}
              >
                {method === 'COD' ? 'Cash on delivery' : 'Pay online'}
              </button>
            ))}
          </div>
          {paymentMethod === 'ONLINE' ? (
            <p className="mt-3 text-xs text-muted">
              Online payments use Razorpay. Confirmation depends on backend payment
              wiring — COD is safest for first orders.
            </p>
          ) : null}

          <div className="mt-5">
            <Input
              label="Delivery instructions"
              placeholder="Gate code, landmark, avoid bell…"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-line bg-ink p-5 text-white md:p-6">
        <h2 className="font-display text-3xl tracking-wide">Pay</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between text-white/75">
            <span>Item total</span>
            <span>{formatINR(cart.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-white/75">
            <span>Delivery</span>
            <span>{deliveryFee ? formatINR(deliveryFee) : 'Calculated'}</span>
          </div>
          {discount ? (
            <div className="flex justify-between text-ember">
              <span>Coupon</span>
              <span>-{formatINR(discount)}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="Coupon"
            className="h-11 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 text-sm outline-none placeholder:text-white/40"
          />
          <Button variant="secondary" size="sm" onClick={applyCoupon}>
            Apply
          </Button>
        </div>

        <Button
          className="mt-6 w-full"
          disabled={submitting}
          onClick={placeOrder}
        >
          {submitting ? 'Placing…' : `Place ${paymentMethod} order`}
        </Button>
        <p className="mt-3 text-xs text-white/45">
          Ordering as {user?.name || user?.phone}
        </p>
      </aside>
    </div>
  )
}
