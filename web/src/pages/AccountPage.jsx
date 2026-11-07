import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  MapPin,
  Package,
  Store,
  LogOut,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  X,
  CreditCard,
  Heart,
  Settings,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react'
import { usersApi, ordersApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useUiStore } from '@/stores/ui.store'
import { Spinner } from '@/components/ui/Spinner'
import { formatINRFromPaise } from '@/utils/money'
import { validatePincode, validateRequired } from '@/utils/validators'

export function AccountPage() {
  const { ready, user } = useRequireAuth()
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const vendorStatus = useAuthStore((s) => s.vendorStatus)
  const toast = useUiStore((s) => s.toast)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'addresses' | 'orders'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  })
  const [addressErrors, setAddressErrors] = useState({})
  const [savingAddress, setSavingAddress] = useState(false)

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setEmail(user.email || '')
    usersApi
      .addresses()
      .then(setAddresses)
      .catch(() => setAddresses([]))
      .finally(() => setLoadingAddresses(false))
  }, [user])

  useEffect(() => {
    if (activeTab === 'orders' && !orders.length) {
      setLoadingOrders(true)
      ordersApi
        .mine({ limit: 10 })
        .then((res) => setOrders(res.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false))
    }
  }, [activeTab, orders.length])

  if (!ready) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#120b0d]" />
      </div>
    )
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    if (!name.trim()) {
      toast('Name cannot be empty', 'error')
      return
    }

    setSavingProfile(true)
    try {
      const updated = await usersApi.updateMe({
        name: name.trim(),
        email: email.trim() || undefined,
      })
      setUser(updated)
      toast('Profile updated successfully', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault()
    setAddressErrors({})

    const errors = {}
    const lineErr = validateRequired(newAddress.line1, 'Address line')
    if (lineErr) errors.line1 = lineErr

    const cityErr = validateRequired(newAddress.city, 'City')
    if (cityErr) errors.city = cityErr

    const pinErr = validatePincode(newAddress.pincode)
    if (pinErr) errors.pincode = pinErr

    if (Object.keys(errors).length > 0) {
      setAddressErrors(errors)
      return
    }

    setSavingAddress(true)
    try {
      const created = await usersApi.addAddress(newAddress)
      setAddresses((prev) => [...prev, created])
      setShowAddressModal(false)
      setNewAddress({
        label: 'Home',
        line1: '',
        line2: '',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      })
      toast('Delivery address added', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingAddress(false)
    }
  }

  async function handleDeleteAddress(addressId) {
    try {
      await usersApi.deleteAddress(addressId)
      setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== addressId))
      toast('Address removed', 'info')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const isSellerRole =
    ['restaurant_owner', 'merchant_owner'].includes(user?.role) ||
    vendorStatus === 'active_seller'

  const userInitial = (user?.name || 'Vendra Member').charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#120b0d] py-10 sm:py-14">
      <div className="container-app max-w-5xl">

        {/* ── 1. CLEAN ARCHITECTURAL HEADER (NO GRADIENTS, PURE MINIMAL BALANCE) ── */}
        <header className="pb-8 border-b border-black/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Minimal Square Monogram */}
            <div className="size-16 sm:size-18 rounded-2xl bg-white border border-black/10 flex items-center justify-center text-2xl font-black text-[#120b0d] shadow-xs">
              {userInitial}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#990024]">
                  Member Account
                </span>
                <span className="text-[10px] font-bold text-[#8c8587]">·</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  Active
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#120b0d] tracking-tight">
                {user?.name || 'Vendra Member'}
              </h1>

              <p className="text-xs text-[#736c6e] font-medium flex items-center gap-2">
                <span>{user?.phone || 'Mobile Active'}</span>
                {user?.email && (
                  <>
                    <span>·</span>
                    <span>{user.email}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3">
            {isSellerRole ? (
              <Link
                to="/vendor/dashboard"
                className="rounded-xl bg-[#120b0d] hover:bg-[#990024] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
              >
                Merchant Portal →
              </Link>
            ) : (
              <Link
                to="/vendor/register"
                className="rounded-xl bg-white text-[#120b0d] hover:border-[#120b0d] border border-black/15 px-5 py-2.5 text-xs font-bold transition-all shadow-xs"
              >
                Sell on Vendra
              </Link>
            )}

            <button
              onClick={async () => {
                await logout()
                toast('Signed out', 'info')
                navigate('/')
              }}
              className="size-10 rounded-xl bg-white border border-black/15 flex items-center justify-center text-[#736c6e] hover:text-rose-600 hover:border-rose-300 transition cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        {/* ── 2. CLEAN TWO-COLUMN PROPORTIONAL WORKSPACE ── */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Column (3 of 12 cols) */}
          <nav className="md:col-span-4 rounded-2xl bg-white border border-black/[0.08] p-2 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeTab === 'profile'
                  ? 'bg-[#120b0d] text-white'
                  : 'text-[#6e686a] hover:bg-[#f7f6f3] hover:text-[#120b0d]'
              }`}
            >
              <User className="size-4 shrink-0" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeTab === 'addresses'
                  ? 'bg-[#120b0d] text-white'
                  : 'text-[#6e686a] hover:bg-[#f7f6f3] hover:text-[#120b0d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0" />
                <span>Saved Addresses</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-black/5 text-[#736c6e]'
              }`}>
                {addresses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                activeTab === 'orders'
                  ? 'bg-[#120b0d] text-white'
                  : 'text-[#6e686a] hover:bg-[#f7f6f3] hover:text-[#120b0d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="size-4 shrink-0" />
                <span>Order History</span>
              </div>
              <ArrowRight className="size-3.5 opacity-50" />
            </button>
          </nav>

          {/* Right Main Content Card (8 of 12 cols - perfectly balanced) */}
          <main className="md:col-span-8 rounded-2xl bg-white border border-black/[0.08] p-6 sm:p-8">
            
            {/* TAB: Personal Details */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="border-b border-black/[0.06] pb-4">
                  <h2 className="text-lg font-black text-[#120b0d] tracking-tight">
                    Personal Information
                  </h2>
                  <p className="text-xs text-[#736c6e] mt-0.5">
                    Update your account details and contact information.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-4 py-2.5 text-sm font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d] focus:ring-1 focus:ring-[#120b0d]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#120b0d]">
                        Mobile Number
                      </label>
                      <div className="flex items-center justify-between rounded-xl bg-[#f7f6f3] border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#6e686a]">
                        <span>{user?.phone || 'Not linked'}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#120b0d]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@domain.com"
                        className="w-full rounded-xl bg-white border border-black/15 px-4 py-2.5 text-sm font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d] focus:ring-1 focus:ring-[#120b0d]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="rounded-xl bg-[#120b0d] hover:bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? 'Saving...' : 'Update Details'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                  <div>
                    <h2 className="text-lg font-black text-[#120b0d] tracking-tight">
                      Saved Addresses
                    </h2>
                    <p className="text-xs text-[#736c6e] mt-0.5">
                      Your saved addresses for fast checkout.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-[#120b0d] hover:bg-black text-white px-4 py-2 text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((addr) => {
                    const addrId = addr._id || addr.id
                    return (
                      <div
                        key={addrId}
                        className="rounded-xl border border-black/10 p-4 flex flex-col justify-between hover:border-black/30 transition bg-[#faf9f7]"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#120b0d] bg-white px-2 py-0.5 rounded border border-black/10">
                              {addr.label || 'Home'}
                            </span>

                            <button
                              onClick={() => handleDeleteAddress(addrId)}
                              className="size-6 rounded text-[#8c8587] hover:text-rose-600 grid place-items-center transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          <p className="text-xs font-bold text-[#120b0d] leading-snug pt-1">
                            {addr.line1}
                          </p>
                          {addr.line2 && (
                            <p className="text-[11px] text-[#736c6e]">
                              {addr.line2}
                            </p>
                          )}
                          <p className="text-[11px] text-[#736c6e] font-medium">
                            {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {!addresses.length && (
                    <div className="col-span-full rounded-xl border border-dashed border-black/15 p-8 text-center space-y-2">
                      <MapPin className="size-8 mx-auto text-[#8c8587]" />
                      <p className="text-xs font-bold text-[#120b0d]">No addresses saved</p>
                      <button
                        onClick={() => setShowAddressModal(true)}
                        className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#120b0d] text-white px-3.5 py-1.5 text-xs font-bold"
                      >
                        <Plus className="size-3" /> Add Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Order History */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="border-b border-black/[0.06] pb-4">
                  <h2 className="text-lg font-black text-[#120b0d] tracking-tight">
                    Order History
                  </h2>
                  <p className="text-xs text-[#736c6e] mt-0.5">
                    Track and review past orders.
                  </p>
                </div>

                {loadingOrders ? (
                  <div className="py-10 flex justify-center">
                    <Spinner className="size-6 text-[#120b0d]" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((ord) => (
                      <Link
                        key={ord._id}
                        to={`/orders/${ord._id}`}
                        className="flex items-center justify-between rounded-xl border border-black/10 p-4 hover:border-black/30 transition bg-[#faf9f7]"
                      >
                        <div>
                          <span className="text-[11px] font-mono font-bold text-[#736c6e]">
                            #{ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                          </span>
                          <h4 className="text-xs font-bold text-[#120b0d] mt-0.5">
                            {ord.items?.length || 1} {ord.items?.length === 1 ? 'item' : 'items'}
                          </h4>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#120b0d] block">
                            {formatINRFromPaise(ord.pricing?.finalTotalPaise || ord.totalAmount * 100 || 0)}
                          </span>
                          <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                            {ord.status || 'PROCESSING'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-black/15 p-8 text-center space-y-2">
                    <Package className="size-8 mx-auto text-[#8c8587]" />
                    <p className="text-xs font-bold text-[#120b0d]">No orders placed yet</p>
                    <Link
                      to="/categories"
                      className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[#120b0d] text-white px-4 py-1.5 text-xs font-bold"
                    >
                      Explore Catalog
                    </Link>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>

      </div>

      {/* ── ADDRESS MODAL ── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowAddressModal(false)}
              className="absolute right-4 top-4 size-7 rounded-full bg-black/5 hover:bg-black/10 text-[#120b0d] grid place-items-center transition cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <h3 className="text-base font-black text-[#120b0d]">Add New Address</h3>

            <form onSubmit={handleAddAddress} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#120b0d]">Label</label>
                <div className="mt-1 flex gap-2">
                  {['Home', 'Work', 'Other'].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setNewAddress({ ...newAddress, label: l })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        newAddress.label === l
                          ? 'bg-[#120b0d] text-white'
                          : 'bg-[#f4f3f0] text-[#6e686a]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#120b0d]">Address Line 1</label>
                <input
                  type="text"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  placeholder="Flat / House / Street"
                  className="mt-1 w-full rounded-lg bg-white border border-black/15 px-3 py-2 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                />
                {addressErrors.line1 && <p className="text-[10px] text-rose-600 mt-0.5">{addressErrors.line1}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[#120b0d]">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  placeholder="Apartment, landmark"
                  className="mt-1 w-full rounded-lg bg-white border border-black/15 px-3 py-2 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#120b0d]">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-white border border-black/15 px-3 py-2 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                  />
                  {addressErrors.city && <p className="text-[10px] text-rose-600 mt-0.5">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-[#120b0d]">Pincode</label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-white border border-black/15 px-3 py-2 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                  />
                  {addressErrors.pincode && <p className="text-[10px] text-rose-600 mt-0.5">{addressErrors.pincode}</p>}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="flex-1 rounded-lg bg-[#f4f3f0] py-2 text-xs font-bold text-[#6e686a] hover:bg-black/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 rounded-lg bg-[#120b0d] hover:bg-black py-2 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
