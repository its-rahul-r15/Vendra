import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, ShieldCheck, CheckCircle2, Clock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { vendorsApi } from '@/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { validateRequired, validatePhone, normalizePhone } from '@/utils/validators'

export function VendorLoginPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const toast = useUiStore((s) => s.toast)

  const [identifier, setIdentifier] = useState('') // phone or email
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [vendorData, setVendorData] = useState(null)
  const [loadingVendorData, setLoadingVendorData] = useState(false)

  // If already logged in, check their vendor status
  useEffect(() => {
    let active = true
    if (user) {
      setLoadingVendorData(true)
      Promise.allSettled([
        vendorsApi.myApplication(),
        vendorsApi.myRestaurants(),
      ]).then(([appRes, restRes]) => {
        if (!active) return
        const app = appRes.status === 'fulfilled' ? appRes.value : null
        const rests = restRes.status === 'fulfilled' ? restRes.value : []
        setVendorData({ application: app, restaurants: rests })
        setLoadingVendorData(false)
      })
    }
    return () => {
      active = false
    }
  }, [user])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) {
      setError('Please enter your phone number or email')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setSubmitting(true)
    try {
      // Determine if identifier is phone or email
      const isPhone = /^\+?[0-9]{10,14}$/.test(identifier.replace(/[\s-]/g, ''))
      const payload = isPhone
        ? { phone: normalizePhone(identifier), password }
        : { email: identifier.trim(), password }

      const res = await login(payload)
      toast('Signed in to Vendor Portal', 'success')
    } catch (err) {
      setError(err.message || 'Login failed')
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const isSellerRole = ['restaurant_owner', 'merchant_owner'].includes(user?.role)

  return (
    <div className="container-app max-w-2xl py-12 animate-rise">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#121212] bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#121212]">
          <Store className="size-3.5" /> Merchant Portal
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0a0a0a] sm:text-4xl">
          Vendor Sign In
        </h1>
        <p className="mx-auto mt-2 max-w-md text-base text-[#575550]">
          Manage your store catalog, orders, and merchant profile.
        </p>
      </div>

      {/* If User is already signed in */}
      {user ? (
        <div className="mt-8 rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
          {loadingVendorData ? (
            <div className="flex justify-center py-12">
              <Spinner className="size-8 text-[#0a0a0a]" />
            </div>
          ) : isSellerRole ? (
            /* Active Seller Status View */
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#c8e6c9] bg-[#edf7ed] p-4 text-[#1e7041]">
                <CheckCircle2 className="size-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Active Seller Account</h3>
                  <p className="text-xs text-[#1e7041]">
                    Signed in as {user.name} ({user.phone || user.email})
                  </p>
                </div>
              </div>

              {vendorData?.restaurants?.length ? (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#737069]">
                    Your Registered Stores ({vendorData.restaurants.length})
                  </h4>
                  <div className="mt-3 space-y-2">
                    {vendorData.restaurants.map((rest) => (
                      <div
                        key={rest._id || rest.id}
                        className="flex items-center justify-between rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-4"
                      >
                        <div>
                          <p className="font-bold text-[#121212]">{rest.name}</p>
                          <p className="text-xs text-[#737069]">{rest.address?.city || 'Active Store'}</p>
                        </div>
                        <Link
                          to={`/shops/${rest._id || rest.id}`}
                          className="text-xs font-semibold text-[#0a0a0a] underline"
                        >
                          View Storefront →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-5 text-sm text-[#575550]">
                  <p className="font-semibold text-[#0a0a0a]">Welcome to Vendra Merchant Portal!</p>
                  <p className="mt-1 text-xs text-[#737069]">
                    Your account is registered as a verified seller. You can preview all vendor stores or request assistance from our platform team.
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Link to="/shops" className="text-xs font-bold text-[#0a0a0a] underline">
                      Browse All Marketplace Stores →
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#e7e5df] pt-5">
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Sign out
                </Button>
                <Link to="/" className="text-sm font-semibold text-[#0a0a0a] hover:underline">
                  Return to Storefront
                </Link>
              </div>
            </div>
          ) : vendorData?.application ? (
            /* Application Under Review View */
            <div className="space-y-6">
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#ffe082] bg-[#fff8e1] p-4 text-[#8d6e15]">
                <Clock className="size-6 shrink-0" />
                <div>
                  <h3 className="font-bold text-base">Application Under Review</h3>
                  <p className="text-xs">
                    Your seller application has been submitted and is being verified by our operations team.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#737069]">Business Name:</span>
                  <span className="font-semibold text-[#0a0a0a]">
                    {vendorData.application.name || vendorData.application.sellerApplication?.businessName || 'Business'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737069]">Vertical:</span>
                  <span className="font-semibold text-[#0a0a0a] uppercase">
                    {vendorData.application.vertical || 'Food & Retail'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737069]">Status:</span>
                  <span className="font-bold text-[#8d6e15] uppercase">
                    {vendorData.application.approval?.status || 'Pending Verification'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#e7e5df] pt-5">
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Sign out
                </Button>
                <Link to="/" className="text-sm font-semibold text-[#0a0a0a] hover:underline">
                  Continue Browsing
                </Link>
              </div>
            </div>
          ) : (
            /* Customer Account Logged In -> Prompt to Register as Vendor */
            <div className="space-y-6 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#faf9f5] border border-[#e7e5df] text-[#0a0a0a]">
                <UserCheck className="size-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">
                  Signed in as Customer
                </h3>
                <p className="mt-1 text-sm text-[#575550]">
                  Your current account ({user.name || user.phone}) is registered as a buyer. Register as a vendor to open your store.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="primary" onClick={() => navigate('/vendor/register')}>
                  Apply as a Seller Now
                </Button>
                <Button variant="outline" onClick={() => logout()}>
                  Sign in with Different Account
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Sign In Form */
        <div className="mt-8 rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-10 shadow-sm">
          {error ? (
            <div className="mb-6 rounded-xl border border-[#ffcdd2] bg-[#fdeeed] p-4 text-sm font-medium text-[#b82828]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Merchant Phone Number or Email"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 9876543210 or owner@business.com"
              required
            />

            <Input
              label="Account Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={submitting}
            >
              {submitting ? 'Authenticating…' : 'Sign in to Merchant Portal'}
            </Button>
          </form>

          <div className="mt-8 border-t border-[#e7e5df] pt-6 text-center text-sm text-[#737069]">
            <p>
              New to Vendra?{' '}
              <Link to="/vendor/register" className="font-bold text-[#0a0a0a] underline">
                Register as a vendor
              </Link>
            </p>
            <p className="mt-2 text-xs text-[#99958d]">
              Customer looking to shop?{' '}
              <Link to="/login" className="underline">
                Customer sign in
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

