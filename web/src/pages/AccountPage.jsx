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
} from 'lucide-react'
import { usersApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useUiStore } from '@/stores/ui.store'
import { Spinner } from '@/components/ui/Spinner'
import { validatePincode, validateRequired } from '@/utils/validators'

export function AccountPage() {
  const { ready, user } = useRequireAuth()
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const vendorStatus = useAuthStore((s) => s.vendorStatus)
  const toast = useUiStore((s) => s.toast)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'addresses'
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

  if (!ready) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#990024]" />
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

  return (
    <div className="container-app py-8 sm:py-12 animate-rise max-w-5xl">
      {/* ── 1. ARCHITECTURAL MINIMALIST PROFILE HEADER ── */}
      <div className="pb-8 border-b border-black/[0.08] flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#990024]">
            Member Account
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#120b0d] tracking-tight mt-1">
            {user?.name || 'My Account'}
          </h1>
          <p className="text-xs text-[#6e686a] font-medium mt-1 flex items-center gap-3">
            <span>{user?.phone || 'Mobile Verified'}</span>
            <span>•</span>
            <span>{user?.email || 'No email attached'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSellerRole ? (
            <Link
              to="/vendor/dashboard"
              className="rounded-full bg-[#120b0d] hover:bg-[#990024] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              Merchant Console →
            </Link>
          ) : (
            <Link
              to="/vendor/register"
              className="rounded-full bg-[#fdf2f4] text-[#990024] hover:bg-[#990024] hover:text-white px-5 py-2.5 text-xs font-bold transition-all border border-[#990024]/20"
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
            className="size-9 rounded-full border border-black/15 flex items-center justify-center text-[#120b0d] hover:bg-black/5 transition cursor-pointer"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* ── 2. EDITORIAL TAB STRIP ── */}
      <div className="flex items-center gap-8 border-b border-black/[0.06] pt-6 pb-3 text-xs font-black uppercase tracking-widest text-[#8c8587]">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 relative transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'text-[#120b0d]'
              : 'hover:text-[#120b0d]'
          }`}
        >
          <span>Personal Details</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#990024] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 relative transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'text-[#120b0d]'
              : 'hover:text-[#120b0d]'
          }`}
        >
          <span>Saved Addresses</span>
          <span className="size-4 rounded-full bg-black/10 text-[9px] grid place-items-center">
            {addresses.length}
          </span>
          {activeTab === 'addresses' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#990024] rounded-full" />
          )}
        </button>

        <button
          onClick={() => navigate('/orders')}
          className="pb-3 text-[#8c8587] hover:text-[#120b0d] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Past Orders</span>
          <ArrowRight className="size-3" />
        </button>
      </div>

      {/* ── 3. WORKSPACE VIEW ── */}
      <div className="py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleSaveProfile} className="space-y-6">
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
                  className="w-full rounded-2xl bg-white border border-black/10 px-4 py-3 text-sm font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#120b0d]">
                    Mobile Number
                  </label>
                  <div className="flex items-center rounded-2xl bg-[#f7f6f3] border border-black/5 px-4 py-3 text-sm font-bold text-[#6e686a]">
                    <span>{user?.phone || 'Not linked'}</span>
                    <span className="ml-auto text-[10px] uppercase font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
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
                    placeholder="name@vendra.com"
                    className="w-full rounded-2xl bg-white border border-black/10 px-4 py-3 text-sm font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-full bg-[#120b0d] hover:bg-[#990024] text-white px-8 py-3 text-xs font-black uppercase tracking-wider transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2">
              <p className="text-xs text-[#6e686a] font-medium">
                Default destinations for rapid one-click checkout.
              </p>

              <button
                onClick={() => setShowAddressModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-[#120b0d] hover:bg-[#990024] text-white px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id
                return (
                  <div
                    key={addrId}
                    className="rounded-2xl bg-white border border-black/10 p-5 flex flex-col justify-between hover:border-[#990024]/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#990024] bg-[#fdf2f4] px-2.5 py-0.5 rounded-full">
                          {addr.label || 'Home'}
                        </span>

                        <button
                          onClick={() => handleDeleteAddress(addrId)}
                          className="size-6 rounded-full text-[#8c8587] hover:bg-rose-50 hover:text-rose-600 grid place-items-center transition cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-[#120b0d] leading-snug">
                        {addr.line1}
                      </p>
                      {addr.line2 ? (
                        <p className="text-xs text-[#6e686a] font-medium">
                          {addr.line2}
                        </p>
                      ) : null}
                      <p className="text-xs text-[#6e686a] font-semibold">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>
                  </div>
                )
              })}

              {!addresses.length && (
                <div className="col-span-full rounded-2xl border border-dashed border-black/10 p-10 text-center space-y-2">
                  <MapPin className="size-8 mx-auto text-[#8c8587]" />
                  <p className="text-xs font-bold text-[#120b0d]">No addresses saved yet</p>
                  <p className="text-xs text-[#8c8587]">Add a delivery address to start ordering.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-rise">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <h3 className="text-lg font-black text-[#120b0d]">
                Add Delivery Address
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="size-8 rounded-full bg-slate-100 text-[#120b0d] grid place-items-center hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="mt-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {['Home', 'Office', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewAddress((a) => ({ ...a, label: lbl }))}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      newAddress.label === lbl
                        ? 'bg-[#120b0d] text-white border-[#120b0d]'
                        : 'bg-slate-50 text-[#5c5658] border-black/5 hover:bg-slate-100'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-[#120b0d]">Address Line 1 *</label>
                <input
                  type="text"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))}
                  placeholder="Flat, House no., Building, Apartment"
                  className="mt-1 w-full rounded-xl bg-slate-50 border border-black/10 p-3 text-xs font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                  required
                />
                {addressErrors.line1 && <p className="text-[10px] text-rose-600 mt-0.5">{addressErrors.line1}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-[#120b0d]">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress((a) => ({ ...a, line2: e.target.value }))}
                  placeholder="Street, Sector, Landmark"
                  className="mt-1 w-full rounded-xl bg-slate-50 border border-black/10 p-3 text-xs font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#120b0d]">City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-black/10 p-3 text-xs font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#120b0d]">State *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress((a) => ({ ...a, state: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-black/10 p-3 text-xs font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#120b0d]">Pincode *</label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress((a) => ({ ...a, pincode: e.target.value }))}
                    maxLength={6}
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-black/10 p-3 text-xs font-semibold text-[#120b0d] focus:outline-none focus:ring-2 focus:ring-[#990024]"
                    required
                  />
                  {addressErrors.pincode && <p className="text-[10px] text-rose-600 mt-0.5">{addressErrors.pincode}</p>}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 px-5 py-2.5 text-xs font-bold text-[#5c5658] transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="rounded-full bg-[#120b0d] hover:bg-[#990024] text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-50"
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
