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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { usersApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useUiStore } from '@/stores/ui.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { validatePincode, validateRequired } from '@/utils/validators'

export function AccountPage() {
  const { ready, user } = useRequireAuth()
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const vendorStatus = useAuthStore((s) => s.vendorStatus)
  const toast = useUiStore((s) => s.toast)
  const navigate = useNavigate()

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
        <Spinner className="size-8 text-[#0a0a0a]" />
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
      const added = await usersApi.addAddress({
        label: newAddress.label,
        line1: newAddress.line1.trim(),
        line2: newAddress.line2.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        pincode: newAddress.pincode.trim(),
        location: { type: 'Point', coordinates: [77.209, 28.6139] },
      })
      setAddresses((prev) => [...prev, added])
      setShowAddressModal(false)
      setNewAddress({
        label: 'Home',
        line1: '',
        line2: '',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
      })
      toast('New address saved', 'success')
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

  const isSellerRole = ['restaurant_owner', 'merchant_owner'].includes(user?.role) || vendorStatus === 'active_seller'

  return (
    <div className="container-app max-w-4xl py-10 animate-rise">
      <div className="mb-8 border-b border-[#e7e5df] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
            My Account
          </span>
          <h1 className="mt-1 text-3xl font-black text-[#0a0a0a]">
            Account & Settings
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await logout()
            toast('Logged out', 'info')
            navigate('/')
          }}
          className="gap-2"
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        {/* Left Column: Profile and Addresses */}
        <div className="space-y-8">
          {/* Profile Form */}
          <section className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-4 flex items-center gap-2">
              <User className="size-5" /> Profile Information
            </h2>

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Registered Mobile Number"
                  value={user?.phone || ''}
                  disabled
                  hint="Phone number is verified"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mail.com"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving…' : 'Save Profile Changes'}
              </Button>
            </form>
          </section>

          {/* Addresses */}
          <section className="rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e7e5df] pb-4">
              <h2 className="text-lg font-bold text-[#0a0a0a] flex items-center gap-2">
                <MapPin className="size-5" /> Saved Addresses
              </h2>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-[#0a0a0a] underline uppercase tracking-wider"
              >
                + Add Address
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {addresses.map((addr) => {
                const addrId = addr._id || addr.id
                return (
                  <div
                    key={addrId}
                    className="flex items-center justify-between rounded-2xl border border-[#e7e5df] bg-[#faf9f5] p-4 text-sm"
                  >
                    <div>
                      <p className="font-bold text-[#0a0a0a]">{addr.label || 'Address'}</p>
                      <p className="mt-0.5 text-xs text-[#575550]">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Delete address"
                      onClick={() => handleDeleteAddress(addrId)}
                      className="grid size-8 place-items-center rounded-lg text-[#737069] hover:bg-black/5 hover:text-[#b82828]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )
              })}

              {!addresses.length ? (
                <p className="rounded-xl border border-dashed border-[#e7e5df] p-6 text-center text-sm text-[#737069]">
                  No delivery addresses saved yet.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* Right Column: Quick Links & Vendor Panel Card */}
        <aside className="space-y-6">
          {/* Orders Box */}
          <div className="rounded-3xl border border-[#e7e5df] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#0a0a0a] flex items-center gap-2">
              <Package className="size-4" /> Order History
            </h3>
            <p className="mt-2 text-xs text-[#737069] leading-relaxed">
              Track active dispatches, view invoice details, or re-order past purchases.
            </p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-between"
                onClick={() => navigate('/orders')}
              >
                <span>View All Orders</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Vendor Partnership Card */}
          <div className="rounded-3xl border border-[#121212] bg-[#0a0a0a] p-6 text-white shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              <Store className="size-3" /> Merchant Portal
            </span>

            {isSellerRole ? (
              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-bold text-white">
                  You are a Registered Seller
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Access your store console to view incoming orders and manage inventory.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/vendor/login')}
                  className="w-full bg-white text-[#0a0a0a] hover:bg-[#faf9f5]"
                >
                  Open Vendor Portal
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-bold text-white">
                  Sell on Vendra
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  List your products or food kitchen on our curated marketplace and start reaching customers.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/vendor/register')}
                  className="w-full bg-white text-[#0a0a0a] hover:bg-[#faf9f5]"
                >
                  Register as a Vendor
                </Button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Add Address Modal */}
      {showAddressModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-rise">
            <h3 className="text-lg font-bold text-[#0a0a0a]">Add New Address</h3>

            <form onSubmit={handleAddAddress} className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="Label"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                  placeholder="Home, Office"
                />
                <Input
                  label="Pincode"
                  value={newAddress.pincode}
                  onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                  error={addressErrors.pincode}
                  required
                />
              </div>

              <Input
                label="Address Line"
                value={newAddress.line1}
                onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                error={addressErrors.line1}
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  label="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  error={addressErrors.city}
                  required
                />
                <Input
                  label="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={savingAddress}
                >
                  {savingAddress ? 'Saving…' : 'Save Address'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
