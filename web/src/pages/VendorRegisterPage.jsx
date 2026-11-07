import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Store,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Check,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { vendorsApi } from '@/api'
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateRequired,
  validatePincode,
  normalizePhone,
} from '@/utils/validators'

export function VendorRegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const login = useAuthStore((s) => s.login)
  const currentUser = useAuthStore((s) => s.user)
  const toast = useUiStore((s) => s.toast)

  const [mode, setMode] = useState('direct') // 'direct' | 'application'
  const [submitting, setSubmitting] = useState(false)
  const [successResult, setSuccessResult] = useState(null)
  const [errors, setErrors] = useState({})

  const [form, setForm] = useState({
    businessName: '',
    ownerName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    password: '',
    businessType: 'restaurant',
    line1: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    gstNumber: '',
    fssaiNumber: '',
  })

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  async function handleDirectRegister(e) {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    const nameErr = validateRequired(form.ownerName, 'Full name')
    if (nameErr) newErrors.ownerName = nameErr

    const phoneErr = validatePhone(form.phone)
    if (phoneErr) newErrors.phone = phoneErr

    const emailErr = validateEmail(form.email, false)
    if (emailErr) newErrors.email = emailErr

    const passErr = validatePassword(form.password, true)
    if (passErr) newErrors.password = passErr

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast('Please correct form errors', 'error')
      return
    }

    setSubmitting(true)
    try {
      const cleanPhone = normalizePhone(form.phone)
      await register({
        name: form.ownerName.trim(),
        phone: cleanPhone,
        email: form.email.trim() || undefined,
        password: form.password,
        role: 'restaurant_owner',
      })

      try {
        await login({ phone: cleanPhone, password: form.password })
      } catch {
        // user will log in manually
      }

      setSuccessResult({
        title: 'Merchant Account Created',
        message: 'Your seller account has been activated. Welcome to the Vendra Merchant ecosystem.',
      })
      toast('Merchant account created successfully!', 'success')
    } catch (err) {
      setErrors({ form: err.message })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFormalApplication(e) {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    const bNameErr = validateRequired(form.businessName, 'Business name')
    if (bNameErr) newErrors.businessName = bNameErr

    const oNameErr = validateRequired(form.ownerName, 'Owner name')
    if (oNameErr) newErrors.ownerName = oNameErr

    const phoneErr = validatePhone(form.phone)
    if (phoneErr) newErrors.phone = phoneErr

    const emailErr = validateEmail(form.email, true)
    if (emailErr) newErrors.email = emailErr

    const lineErr = validateRequired(form.line1, 'Address line')
    if (lineErr) newErrors.line1 = lineErr

    const cityErr = validateRequired(form.city, 'City')
    if (cityErr) newErrors.city = cityErr

    const pinErr = validatePincode(form.pincode)
    if (pinErr) newErrors.pincode = pinErr

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast('Please complete all required fields', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (!currentUser) {
        if (!form.password || form.password.length < 8) {
          setErrors({ password: 'Password of at least 8 characters is required' })
          setSubmitting(false)
          return
        }
        const cleanPhone = normalizePhone(form.phone)
        await register({
          name: form.ownerName.trim(),
          phone: cleanPhone,
          email: form.email.trim(),
          password: form.password,
          role: 'customer',
        })
        await login({ phone: cleanPhone, password: form.password })
      }

      const payload = {
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        phone: normalizePhone(form.phone),
        email: form.email.trim(),
        businessType: form.businessType,
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
        gstNumber: form.gstNumber.trim() || undefined,
        fssaiNumber: form.fssaiNumber.trim() || undefined,
      }

      const res = await vendorsApi.apply(payload)
      setSuccessResult({
        title: 'Application Received',
        message: `Your merchant onboarding request (Ref: ${res?.applicationId || 'PENDING'}) has been submitted for review.`,
      })
      toast('Application submitted successfully!', 'success')
    } catch (err) {
      setErrors({ form: err.message })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#120b0d] py-12 sm:py-16 animate-rise">
      <div className="container-app max-w-4xl">

        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto pb-8 border-b border-black/[0.08]">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#990024] bg-[#fdf2f4] px-3 py-1 rounded-full border border-[#990024]/15 inline-block">
            Merchant Partnership
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#120b0d] tracking-tight">
            Partner With Vendra
          </h1>
          <p className="text-xs text-[#736c6e] font-medium leading-relaxed">
            Distribute your catalog, luxury goods or artisan creations to thousands of verified buyers across India.
          </p>

          <p className="pt-2 text-xs text-[#8c8587]">
            Already an approved merchant?{' '}
            <Link to="/vendor/login" className="font-bold text-[#120b0d] hover:text-[#990024] underline underline-offset-4 transition">
              Sign in to Console →
            </Link>
          </p>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="mt-10 rounded-2xl border border-black/10 bg-white p-8 sm:p-12 text-center shadow-xs max-w-xl mx-auto space-y-4">
            <div className="size-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="text-2xl font-black text-[#120b0d]">{successResult.title}</h2>
            <p className="text-xs text-[#736c6e] leading-relaxed max-w-md mx-auto">
              {successResult.message}
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                to="/vendor/login"
                className="rounded-xl bg-[#120b0d] hover:bg-black text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition"
              >
                Go to Merchant Portal
              </Link>
              <Link
                to="/"
                className="rounded-xl bg-[#f4f3f0] hover:bg-black/10 text-[#120b0d] px-6 py-2.5 text-xs font-bold transition"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Form Container */
          <div className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-10 shadow-xs max-w-2xl mx-auto">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 rounded-xl bg-[#f4f3f0] p-1.5 mb-8 text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('direct')
                  setErrors({})
                }}
                className={`py-2.5 rounded-lg transition cursor-pointer ${
                  mode === 'direct'
                    ? 'bg-white text-[#120b0d] shadow-xs'
                    : 'text-[#736c6e] hover:text-[#120b0d]'
                }`}
              >
                Direct Seller Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('application')
                  setErrors({})
                }}
                className={`py-2.5 rounded-lg transition cursor-pointer ${
                  mode === 'application'
                    ? 'bg-white text-[#120b0d] shadow-xs'
                    : 'text-[#736c6e] hover:text-[#120b0d]'
                }`}
              >
                Full Merchant Onboarding
              </button>
            </div>

            {errors.form && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
                {errors.form}
              </div>
            )}

            {/* Direct Form */}
            {mode === 'direct' ? (
              <form onSubmit={handleDirectRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#120b0d]">Full Name / Owner Name</label>
                  <input
                    type="text"
                    value={form.ownerName}
                    onChange={(e) => updateField('ownerName', e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                  />
                  {errors.ownerName && <p className="text-[10px] text-rose-600 mt-1">{errors.ownerName}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Mobile Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="10-digit mobile"
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="merchant@example.com"
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#120b0d]">Create Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                  />
                  {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#120b0d] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating Account...' : 'Create Merchant Account'}
                  </button>
                </div>
              </form>
            ) : (
              /* Application Form */
              <form onSubmit={handleFormalApplication} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#120b0d]">Store / Business Name</label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => updateField('businessName', e.target.value)}
                    placeholder="e.g. Aura Audio Lab"
                    required
                    className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                  />
                  {errors.businessName && <p className="text-[10px] text-rose-600 mt-1">{errors.businessName}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Owner Name</label>
                    <input
                      type="text"
                      value={form.ownerName}
                      onChange={(e) => updateField('ownerName', e.target.value)}
                      placeholder="Legal representative"
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.ownerName && <p className="text-[10px] text-rose-600 mt-1">{errors.ownerName}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Mobile Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="10-digit mobile"
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="business@example.com"
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Business Type</label>
                    <select
                      value={form.businessType}
                      onChange={(e) => updateField('businessType', e.target.value)}
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    >
                      <option value="restaurant">Retail / Brand Merchant</option>
                      <option value="grocery">Artisan / Independent Creator</option>
                      <option value="both">Multi-Category Store</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#120b0d]">Registered Address</label>
                  <input
                    type="text"
                    value={form.line1}
                    onChange={(e) => updateField('line1', e.target.value)}
                    placeholder="Floor, building, street"
                    required
                    className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                  />
                  {errors.line1 && <p className="text-[10px] text-rose-600 mt-1">{errors.line1}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#120b0d]">Pincode</label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => updateField('pincode', e.target.value)}
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.pincode && <p className="text-[10px] text-rose-600 mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                {!currentUser && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-[#120b0d]">Account Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full rounded-xl bg-white border border-black/15 px-3.5 py-2.5 text-xs font-semibold text-[#120b0d] focus:outline-none focus:border-[#120b0d]"
                    />
                    {errors.password && <p className="text-[10px] text-rose-600 mt-1">{errors.password}</p>}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#120b0d] hover:bg-black text-white py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Onboarding Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
