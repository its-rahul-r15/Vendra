import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, ShieldCheck, CheckCircle2, Clock, AlertCircle, ArrowRight, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { vendorsApi } from '@/api'
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
      const isPhone = /^\+?[0-9]{10,14}$/.test(identifier.replace(/[\s-]/g, ''))
      const payload = isPhone
        ? { phone: normalizePhone(identifier), password }
        : { email: identifier.trim(), password }

      await login(payload)
      toast('Signed in to Merchant Console', 'success')
      navigate('/vendor/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const isSellerRole = ['restaurant_owner', 'merchant_owner'].includes(user?.role)

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#120b0d] py-14 sm:py-20 animate-rise">
      <div className="container-app max-w-xl">
        {/* Header */}
        <div className="text-center space-y-2 pb-8 border-b border-black/[0.08]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#990024] bg-[#fdf2f4] px-3 py-1 rounded-full border border-[#990024]/15 inline-block">
            Merchant Portal
          </span>
          <h1 className="text-3xl font-black text-[#120b0d] tracking-tight">
            Vendor Sign In
          </h1>
          <p className="text-xs text-[#736c6e] font-medium max-w-sm mx-auto">
            Access your inventory catalog, incoming orders and business analytics.
          </p>
        </div>

        {/* If User is already signed in */}
        {user ? (
          <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs">
            {loadingVendorData ? (
              <div className="flex justify-center py-12">
                <Spinner className="size-8 text-[#120b0d]" />
              </div>
            ) : isSellerRole ? (
              /* Active Seller Status View */
              <div className="space-y-6">
                <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-4 text-emerald-800">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-xs uppercase tracking-wider">Active Merchant Session</h3>
                    <p className="text-xs text-emerald-900 font-medium">
                      Signed in as {user.name} ({user.phone || user.email})
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/vendor/dashboard"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#120b0d] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm"
                  >
                    <span>Launch Merchant Console</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                <div className="flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <button
                    onClick={() => logout()}
                    className="text-xs font-bold text-[#8c8587] hover:text-rose-600 transition cursor-pointer"
                  >
                    Sign out
                  </button>
                  <Link to="/" className="text-xs font-bold text-[#120b0d] hover:text-[#990024] transition">
                    Return to Storefront →
                  </Link>
                </div>
              </div>
            ) : (
              /* Not Yet a Verified Seller */
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-[#736c6e]">
                  Your current account ({user.phone || user.email}) does not have an active merchant role.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    to="/vendor/register"
                    className="rounded-xl bg-[#120b0d] hover:bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition"
                  >
                    Register as Seller
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="rounded-xl bg-[#f4f3f0] hover:bg-black/10 text-[#120b0d] px-5 py-2.5 text-xs font-bold transition cursor-pointer"
                  >
                    Switch Account
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Sign In Form */
          <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-xs">
            {error && (
              <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#120b0d]">Mobile Number or Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or merchant@vendra.com"
                  required
                  className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#120b0d]">Password</label>
                  <Link to="/login" className="text-[10px] text-[#736c6e] hover:text-[#120b0d]">
                    Customer Login?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your vendor password"
                  required
                  className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#120b0d] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Verifying...' : 'Sign In to Portal'}
                </button>
              </div>

              <div className="pt-4 border-t border-black/[0.06] text-center">
                <p className="text-xs text-[#736c6e]">
                  New to Vendra?{' '}
                  <Link to="/vendor/register" className="font-bold text-[#120b0d] hover:text-[#990024] underline">
                    Apply for Merchant Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
