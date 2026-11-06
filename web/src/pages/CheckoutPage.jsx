import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  ShieldCheck,
  Plus,
  Tag,
  CheckCircle2,
  ArrowRight,
  Truck,
  CreditCard,
} from 'lucide-react'
import { checkoutApi, ordersApi, usersApi, couponsApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { validatePincode, validateRequired } from '@/utils/validators'

export function CheckoutPage() {
  const { ready, user } = useRequireAuth()
  const navigate = useNavigate()
  const cart = useCartStore((state) => state.cart)
  const clearCart = useCartStore((state) => state.clear)
  const toast = useUiStore((state) => state.toast)

  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [feeConfig, setFeeConfig] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Address creation form
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  })
  const [addressErrors, setAddressErrors] = useState({})

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')

  useEffect(() => {
    if (!ready) return
    let active = true

    Promise.allSettled([usersApi.addresses(), ordersApi.fees()]).then(
      ([addrRes, feeRes]) => {
        if (!active) return
        if (addrRes.status === 'fulfilled') {
          const list = addrRes.value || []
          setAddresses(list)
          setSelectedAddress(list.find((a) => a.isDefault) || list[0] || null)
        }
        if (feeRes.status === 'fulfilled') {
          setFeeConfig(feeRes.value?.config || null)
        }
        setLoadingAddress(false)
      },
    )

    return () => {
      active = false
    }
  }, [ready])

  if (!ready || loadingAddress) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  if (!cart.items.length) {
    return (
      <div className="container-app py-16">
        <EmptyState
          title="Your cart is empty"
          description="Please add items to your cart before proceeding to checkout."
          actionLabel="Explore catalog"
          onAction={() => navigate('/categories')}
        />
      </div>
    )
  }

  async function handleSaveAddress(e) {
    e.preventDefault()
    setAddressErrors({})

    const errors = {}
    const lineErr = validateRequired(addressForm.line1, 'Address line')
    if (lineErr) errors.line1 = lineErr

    const cityErr = validateRequired(addressForm.city, 'City')
    if (cityErr) errors.city = cityErr

    const pinErr = validatePincode(addressForm.pincode)
    if (pinErr) errors.pincode = pinErr

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors)
      return
    }

    try {
      const newAddress = await usersApi.addAddress({
        label: addressForm.label,
        line1: addressForm.line1.trim(),
        line2: addressForm.line2.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        location: { type: 'Point', coordinates: [77.209, 28.6139] },
      })
      setAddresses((prev) => [...prev, newAddress])
      setSelectedAddress(newAddress)
      setShowAddressForm(false)
      toast('Delivery address saved', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleApplyCoupon(e) {
    e.preventDefault()
    if (!couponCode.trim()) return

    setCouponLoading(true)
    try {
      const res = await couponsApi.validate({
        code: couponCode.trim(),
        cartTotal: cart.subtotal,
      })
      setAppliedCoupon(res)
      toast('Coupon applied!', 'success')
    } catch (err) {
      toast(err.message || 'Invalid coupon code', 'error')
    } finally {
      setCouponLoading(false)
    }
  }

  // Fees calculation
  const deliveryFeePaise = feeConfig?.deliveryFeePaise || 4000 // 40 INR
  const platformFeePaise = feeConfig?.platformFeePaise || 1000 // 10 INR
  const discountPaise = appliedCoupon?.discountAmount || 0
  const grandTotalPaise = Math.max(
    0,
    cart.subtotal + deliveryFeePaise + platformFeePaise - discountPaise,
  )

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast('Please select or add a delivery address', 'error')
      return
    }

    setSubmitting(true)
    try {
      const hasListings = cart.items.some((i) => i.type === 'listing' || i.listingId)

      let orderResult = null

      if (hasListings) {
        // V2 Commerce Session Checkout
        orderResult = await checkoutApi.createSession({
          items: cart.items.map((item) => ({
            listingId: item.listingId || item.id,
            quantity: item.quantity,
          })),
          paymentMethod: 'COD',
          address: {
            line1: selectedAddress.line1,
            line2: selectedAddress.line2 || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            location: selectedAddress.location || {
              type: 'Point',
              coordinates: [77.209, 28.6139],
            },
          },
          couponCode: appliedCoupon?.coupon?.code || undefined,
        })
      } else {
        // Restaurant / Food Order
        orderResult = await ordersApi.place({
          restaurantId: cart.vendorId,
          paymentMethod: 'COD',
          couponCode: appliedCoupon?.coupon?.code || undefined,
          deliveryInstructions,
          deliveryAddress: {
            line1: selectedAddress.line1,
            line2: selectedAddress.line2 || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            pincode: selectedAddress.pincode,
            location: selectedAddress.location || {
              type: 'Point',
              coordinates: [77.209, 28.6139],
            },
          },
          items: cart.items.map((i) => ({
            menuItemId: i.menuItemId || i.id,
            quantity: i.quantity,
          })),
        })
      }

      await clearCart()
      toast('Order placed successfully!', 'success')

      const orderId =
        orderResult?.orders?.[0]?._id ||
        orderResult?.order?._id ||
        orderResult?._id
      if (orderId) {
        navigate(`/orders/${orderId}`)
      } else {
        navigate('/orders')
      }
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-app py-10 animate-rise">
      <div className="mb-8 border-b border-[#e7e5df] pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
          Secure Order
        </span>
        <h1 className="mt-1 text-3xl font-black text-[#0a0a0a]">
          Review & Place Order
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Address, Payment, Instructions */}
        <div className="space-y-8">
          {/* Delivery Address Section */}
          <section className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e7e5df] pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-[#0a0a0a]" />
                <h2 className="text-lg font-bold text-[#0a0a0a]">
                  Delivery Address
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-[#0a0a0a] underline uppercase tracking-wider"
              >
                {showAddressForm ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {/* Address Creation Form */}
            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} className="mt-6 space-y-4 rounded-2xl bg-[#faf9f5] border border-[#e7e5df] p-5">
                <h3 className="text-sm font-bold text-[#0a0a0a]">New Address Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Label"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="Home, Office, Studio"
                  />
                  <Input
                    label="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    error={addressErrors.pincode}
                    required
                  />
                </div>
                <Input
                  label="Street Address / Building"
                  value={addressForm.line1}
                  onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                  placeholder="House/Flat No., Road, Landmark"
                  error={addressErrors.line1}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    error={addressErrors.city}
                    required
                  />
                  <Input
                    label="State"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" variant="primary" size="md">
                  Save and Use Address
                </Button>
              </form>
            ) : null}

            {/* Existing Addresses List */}
            <div className="mt-5 space-y-3">
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id
                const isSelected = (selectedAddress?._id || selectedAddress?.id) === addrId

                return (
                  <button
                    key={addrId}
                    type="button"
                    onClick={() => setSelectedAddress(addr)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-[#0a0a0a] bg-[#faf9f5]'
                        : 'border-[#e7e5df] bg-white hover:border-[#737069]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-[#0a0a0a] flex items-center gap-2">
                        <MapPin className="size-4 text-[#0a0a0a]" />
                        {addr.label || 'Delivery Address'}
                      </p>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#0a0a0a]">
                          <CheckCircle2 className="size-4" /> Selected
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[#575550]">
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                    </p>
                  </button>
                )
              })}

              {!addresses.length && !showAddressForm ? (
                <div className="rounded-xl border border-dashed border-[#e7e5df] p-6 text-center text-sm text-[#737069]">
                  No addresses saved yet. Click "+ Add New Address" above.
                </div>
              ) : null}
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-4">
              Payment Method
            </h2>

            <div className="mt-5 space-y-3">
              <label
                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition ${
                  paymentMethod === 'COD'
                    ? 'border-[#0a0a0a] bg-[#faf9f5]'
                    : 'border-[#e7e5df] bg-white hover:border-[#737069]'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-[#0a0a0a]">
                    Cash / Pay on Delivery (COD)
                  </p>
                  <p className="text-xs text-[#737069]">
                    Pay cash, UPI, or card when your package is handed over at your doorstep.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* Delivery Instructions */}
          <section className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-4">
              Delivery Notes (Optional)
            </h2>
            <div className="mt-4">
              <textarea
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Leave with security guard, gate code #1234, ring doorbell twice"
                rows={2}
                className="w-full rounded-xl border border-[#e7e5df] p-3 text-sm text-[#121212] outline-none transition focus:border-[#0a0a0a]"
              />
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <aside className="space-y-6">
          {/* Coupon Code Section */}
          <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#0a0a0a] flex items-center gap-2">
              <Tag className="size-4" /> Promotional Coupon
            </h3>

            <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code (e.g. SAVE50)"
                className="h-11 flex-1 rounded-xl border border-[#e7e5df] bg-white px-3 text-xs uppercase font-semibold outline-none focus:border-[#0a0a0a]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={couponLoading || !couponCode.trim()}
              >
                {couponLoading ? 'Checking…' : 'Apply'}
              </Button>
            </form>

            {appliedCoupon ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#edf7ed] border border-[#c8e6c9] p-3 text-xs text-[#1e7041]">
                <span>
                  Code <strong>{appliedCoupon.coupon?.code}</strong> applied!
                </span>
                <span className="font-bold">
                  -{formatINRFromPaise(discountPaise)}
                </span>
              </div>
            ) : null}
          </div>

          {/* Pricing Summary */}
          <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-black text-[#0a0a0a]">Order Breakdown</h3>

            <div className="mt-5 space-y-3 border-b border-[#e7e5df] pb-5 text-sm">
              <div className="flex justify-between text-[#575550]">
                <span>Items Subtotal ({cart.items.length})</span>
                <span className="font-semibold text-[#0a0a0a]">
                  {formatINRFromPaise(cart.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-[#575550]">
                <span>Delivery & Logistics</span>
                <span className="font-semibold text-[#0a0a0a]">
                  {formatINRFromPaise(deliveryFeePaise)}
                </span>
              </div>

              <div className="flex justify-between text-[#575550]">
                <span>Marketplace Handling Fee</span>
                <span className="font-semibold text-[#0a0a0a]">
                  {formatINRFromPaise(platformFeePaise)}
                </span>
              </div>

              {discountPaise > 0 ? (
                <div className="flex justify-between text-[#1e7041] font-semibold">
                  <span>Promotional Discount</span>
                  <span>-{formatINRFromPaise(discountPaise)}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex justify-between text-xl font-black text-[#0a0a0a]">
              <span>Final Total</span>
              <span>{formatINRFromPaise(grandTotalPaise)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="mt-6 w-full h-13 text-base font-bold"
              disabled={submitting || !selectedAddress}
              onClick={handlePlaceOrder}
            >
              {submitting ? 'Placing Order…' : 'Confirm & Place Order'}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#737069]">
              <ShieldCheck className="size-4 text-[#0a0a0a]" />
              <span>Direct order to fulfilling vendor · Free cancellation</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
