import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Store, ShieldCheck, CheckCircle2, ArrowRight, Building2, User, Phone, Mail, Lock, MapPin } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'
import { vendorsApi } from '@/api'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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

  const [mode, setMode] = useState('direct') // 'direct' (Seller Sign Up) | 'application' (Full Onboarding)
  const [submitting, setSubmitting] = useState(false)
  const [successResult, setSuccessResult] = useState(null)
  const [errors, setErrors] = useState({})

  // Form State
  const [form, setForm] = useState({
    businessName: '',
    ownerName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    password: '',
    businessType: 'restaurant', // 'restaurant' | 'grocery' | 'both'
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

  // Handle Quick Direct Seller Registration
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

      // Attempt automatic login
      try {
        await login({ phone: cleanPhone, password: form.password })
      } catch {
        // user will log in manually
      }

      setSuccessResult({
        title: 'Vendor Account Created',
        message: 'Your seller account has been activated. You can now access the Vendor Portal.',
      })
      toast('Vendor account created successfully!', 'success')
    } catch (err) {
      setErrors({ form: err.message })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Full Seller Onboarding Application
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
      // If user is not authenticated yet, register them first
      if (!currentUser) {
        if (!form.password || form.password.length < 8) {
          setErrors({ password: 'Password of at least 8 characters is required for your account' })
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

      // Submit formal seller application to POST /vendors/apply
      const applicationPayload = {
        businessName: form.businessName.trim(),
        businessType: form.businessType,
        ownerName: form.ownerName.trim(),
        businessPhone: normalizePhone(form.phone),
        businessEmail: form.email.trim(),
        gstNumber: form.gstNumber.trim() || undefined,
        fssaiNumber: form.fssaiNumber.trim() || undefined,
        businessAddress: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        },
      }

      const res = await vendorsApi.apply(applicationPayload)
      setSuccessResult({
        title: 'Application Submitted for Review',
        message:
          res.message ||
          'Your merchant application is under review. Our operations team will verify your documents shortly.',
      })
      toast('Seller application submitted!', 'success')
    } catch (err) {
      setErrors({ form: err.message })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-app max-w-3xl py-12 animate-rise">
      {/* Header */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#121212] bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#121212]">
          <Store className="size-3.5" /> Merchant Onboarding
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0a0a0a] sm:text-5xl">
          Register as a Vendor
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-base text-[#575550]">
          Sell your products, groceries, or gourmet dishes to thousands of verified buyers on Vendra.
        </p>

        {/* Existing Vendor Login Link */}
        <p className="mt-2 text-sm text-[#737069]">
          Already have a merchant account?{' '}
          <Link to="/vendor/login" className="font-semibold text-[#0a0a0a] underline underline-offset-4">
            Sign in to Vendor Portal
          </Link>
        </p>
      </div>

      {/* Success View */}
      {successResult ? (
        <div className="mt-10 rounded-3xl border border-[#e7e5df] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-[#faf9f5] border border-[#e7e5df] text-[#0a0a0a]">
            <CheckCircle2 className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-[#0a0a0a]">
            {successResult.title}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-base text-[#575550] leading-relaxed">
            {successResult.message}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button variant="primary" onClick={() => navigate('/vendor/login')}>
              Go to Vendor Portal
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Return to Marketplace
            </Button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="mt-10 rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-10 shadow-sm">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-1.5 mb-8 text-center">
            <button
              type="button"
              onClick={() => {
                setMode('direct')
                setErrors({})
              }}
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === 'direct'
                  ? 'bg-white text-[#0a0a0a] shadow-sm'
                  : 'text-[#737069] hover:text-[#0a0a0a]'
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
              className={`rounded-lg py-2.5 text-sm font-semibold transition ${
                mode === 'application'
                  ? 'bg-white text-[#0a0a0a] shadow-sm'
                  : 'text-[#737069] hover:text-[#0a0a0a]'
              }`}
            >
              Full Merchant Application
            </button>
          </div>

          {errors.form ? (
            <div className="mb-6 rounded-xl border border-[#ffcdd2] bg-[#fdeeed] p-4 text-sm font-medium text-[#b82828]">
              {errors.form}
            </div>
          ) : null}

          {/* Mode A: Direct Seller Account Form */}
          {mode === 'direct' ? (
            <form onSubmit={handleDirectRegister} className="space-y-5">
              <div className="rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-4 text-xs text-[#575550]">
                Quickly create a verified seller profile. You can add your catalog and business documents anytime after registration.
              </div>

              <Input
                label="Full Name / Owner Name"
                value={form.ownerName}
                onChange={(e) => updateField('ownerName', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                error={errors.ownerName}
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Business Mobile Number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  error={errors.phone}
                  required
                />

                <Input
                  label="Email Address (Optional)"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="owner@business.com"
                  error={errors.email}
                />
              </div>

              <Input
                label="Create Password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Minimum 8 characters"
                error={errors.password}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={submitting}
                >
                  {submitting ? 'Creating Seller Account…' : 'Create Vendor Account'}
                </Button>
              </div>
            </form>
          ) : (
            /* Mode B: Full Formal Application Form */
            <form onSubmit={handleFormalApplication} className="space-y-6">
              <div className="rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-4 text-xs text-[#575550]">
                Submit your store registration to be verified as an official Vendra partner with instant catalog listing capabilities.
              </div>

              {/* Business Info */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-2">
                  1. Business Details
                </h3>

                <Input
                  label="Registered Business Name"
                  value={form.businessName}
                  onChange={(e) => updateField('businessName', e.target.value)}
                  placeholder="e.g. Artisanal Gourmet Studio"
                  error={errors.businessName}
                  required
                />

                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-medium text-[#2d2b27]">
                    Business Category / Type *
                  </label>
                  <select
                    value={form.businessType}
                    onChange={(e) => updateField('businessType', e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#e7e5df] bg-white px-4 text-base text-[#121212] outline-none transition focus:border-[#121212]"
                  >
                    <option value="restaurant">Dining, Cafe & Gourmet Kitchen</option>
                    <option value="grocery">Grocery, Organic & Essentials</option>
                    <option value="both">Multi-Department (Food & Retail)</option>
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="GST Number (Optional)"
                    value={form.gstNumber}
                    onChange={(e) => updateField('gstNumber', e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                  />
                  <Input
                    label="FSSAI License (Optional for food)"
                    value={form.fssaiNumber}
                    onChange={(e) => updateField('fssaiNumber', e.target.value)}
                    placeholder="14-digit FSSAI number"
                  />
                </div>
              </div>

              {/* Owner Info */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-2">
                  2. Owner Information
                </h3>

                <Input
                  label="Owner / Authorized Representative"
                  value={form.ownerName}
                  onChange={(e) => updateField('ownerName', e.target.value)}
                  placeholder="Full name"
                  error={errors.ownerName}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Contact Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="10-digit number"
                    error={errors.phone}
                    required
                  />

                  <Input
                    label="Official Business Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="contact@business.com"
                    error={errors.email}
                    required
                  />
                </div>

                {!currentUser ? (
                  <Input
                    label="Account Password (for your login)"
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Minimum 8 characters"
                    error={errors.password}
                    required
                  />
                ) : null}
              </div>

              {/* Store Location */}
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-[#0a0a0a] border-b border-[#e7e5df] pb-2">
                  3. Store Location & Address
                </h3>

                <Input
                  label="Store / Warehouse Address Line"
                  value={form.line1}
                  onChange={(e) => updateField('line1', e.target.value)}
                  placeholder="Street, Building, Unit #"
                  error={errors.line1}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="City"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    error={errors.city}
                    required
                  />
                  <Input
                    label="State"
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    required
                  />
                  <Input
                    label="Pincode"
                    value={form.pincode}
                    onChange={(e) => updateField('pincode', e.target.value)}
                    error={errors.pincode}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 text-base font-semibold"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Application…' : 'Submit Seller Application'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

