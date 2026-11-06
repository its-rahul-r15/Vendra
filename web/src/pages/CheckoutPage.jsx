import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ShieldCheck } from 'lucide-react'
import { checkoutApi, usersApi } from '@/api'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function CheckoutPage() {
  const { ready, user } = useRequireAuth()
  const navigate = useNavigate()
  const cart = useCartStore((state) => state.cart)
  const clearCart = useCartStore((state) => state.clear)
  const toast = useUiStore((state) => state.toast)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loadingAddress, setLoadingAddress] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({ label: 'Home', line1: '', city: '', state: '', pincode: '' })

  useEffect(() => {
    if (!ready) return
    usersApi.addresses().then((list) => {
      setAddresses(list)
      setSelectedAddress(list.find((address) => address.isDefault) || list[0] || null)
    }).catch((error) => toast(error.message, 'error')).finally(() => setLoadingAddress(false))
  }, [ready, toast])

  if (!ready || loadingAddress) return <div className="flex justify-center py-24"><Spinner className="size-8" /></div>
  if (!cart.items.length) return <EmptyState title="Your cart is empty" description="Add products before checking out." actionLabel="Explore products" onAction={() => navigate('/search')} />

  async function saveAddress(event) {
    event.preventDefault()
    try {
      const address = await usersApi.addAddress(addressForm)
      setAddresses((previous) => [...previous, address])
      setSelectedAddress(address)
      setShowAddressForm(false)
      toast('Address saved', 'success')
    } catch (error) {
      toast(error.message, 'error')
    }
  }

  async function placeOrder() {
    if (!selectedAddress) {
      toast('Add a delivery address to continue', 'error')
      return
    }
    setSubmitting(true)
    try {
      const result = await checkoutApi.createSession({
        items: cart.items.map((item) => ({ listingId: item.listingId, quantity: item.quantity })),
        paymentMethod: 'COD',
        address: {
          line1: selectedAddress.line1,
          line2: selectedAddress.line2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          location: selectedAddress.location,
        },
      })
      await clearCart()
      const order = result?.orders?.[0]
      toast('Order placed successfully', 'success')
      navigate(order?._id ? `/orders/${order._id}` : '/orders')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-app grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-line bg-surface p-5 md:p-7">
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">Almost yours</p><h1 className="mt-1 text-3xl font-extrabold text-ink">Delivery address</h1></div><button type="button" className="text-sm font-bold text-brand" onClick={() => setShowAddressForm((value) => !value)}>{showAddressForm ? 'Cancel' : 'Add new'}</button></div>
        {showAddressForm ? <form onSubmit={saveAddress} className="mt-5 grid gap-3 sm:grid-cols-2"><Input label="Label" value={addressForm.label} onChange={(event) => setAddressForm({ ...addressForm, label: event.target.value })} /><Input label="Pincode" value={addressForm.pincode} onChange={(event) => setAddressForm({ ...addressForm, pincode: event.target.value })} required /><div className="sm:col-span-2"><Input label="Address line" value={addressForm.line1} onChange={(event) => setAddressForm({ ...addressForm, line1: event.target.value })} required /></div><Input label="City" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} required /><Input label="State" value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} required /><Button type="submit" className="sm:col-span-2">Save address</Button></form> : null}
        <div className="mt-5 space-y-3">{addresses.map((address) => { const addressId = address._id || address.id; const selected = (selectedAddress?._id || selectedAddress?.id) === addressId; return <button key={addressId} type="button" onClick={() => setSelectedAddress(address)} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? 'border-brand bg-brand/5' : 'border-line hover:border-brand/30'}`}><p className="flex items-center gap-2 font-bold text-ink"><MapPin className="size-4 text-brand" />{address.label || 'Address'}</p><p className="mt-1 text-sm text-muted">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} — {address.pincode}</p></button>})}{!addresses.length && !showAddressForm ? <p className="rounded-xl bg-paper p-4 text-sm text-muted">Add a delivery address to place your order.</p> : null}</div>
      </section>

      <aside className="h-fit rounded-3xl border border-line bg-ink p-5 text-white md:p-6"><h2 className="font-display text-3xl tracking-wide">Order summary</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between text-white/75"><span>{cart.items.length} product{cart.items.length === 1 ? '' : 's'}</span><span>{formatINRFromPaise(cart.subtotal)}</span></div><p className="text-xs text-white/50">Delivery and taxes are calculated by the marketplace at order placement.</p></div><div className="mt-5 border-t border-white/15 pt-4"><p className="font-semibold">Cash on delivery</p><p className="mt-1 text-xs text-white/55">Pay when your order arrives.</p></div><Button className="mt-6 w-full" disabled={submitting || !selectedAddress} onClick={placeOrder}>{submitting ? 'Placing order…' : 'Place order'}</Button><p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50"><ShieldCheck className="size-3.5" /> Secure order · {user?.name || user?.email}</p></aside>
    </div>
  )
}
