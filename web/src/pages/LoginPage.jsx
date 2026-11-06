import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Store, ShieldCheck, ArrowRight, Lock, Phone, User, Mail } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateRequired,
  normalizePhone,
} from '@/utils/validators'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const sendOtp = useAuthStore((s) => s.sendOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const refreshCart = useCartStore((s) => s.refresh)
  const toast = useUiStore((s) => s.toast)

  const [tab, setTab] = useState('login') // 'login' | 'otp' | 'register'
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Form Fields
  const [identifier, setIdentifier] = useState('') // phone or email
  const [password, setPassword] = useState('')
  const [otpPhone, setOtpPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [devOtp, setDevOtp] = useState(null)

  // Registration Fields
  const [regName, setRegName] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')

  const redirectTo = location.state?.from || '/'

  // 1. Password Login
  async function handlePasswordLogin(e) {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    if (!identifier.trim()) {
      newErrors.identifier = 'Phone number or email is required'
    }
    if (!password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const isPhone = /^\+?[0-9]{10,14}$/.test(identifier.replace(/[\s-]/g, ''))
      const payload = isPhone
        ? { phone: normalizePhone(identifier), password }
        : { email: identifier.trim(), password }

      await login(payload)
      try {
        await refreshCart()
      } catch {
        /* empty cart is fine */
      }
      toast('Welcome back to Vendra', 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setErrors({ form: err.message || 'Login failed' })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // 2. OTP Flow: Send OTP
  async function handleSendOtp(e) {
    e.preventDefault()
    setErrors({})

    const phoneErr = validatePhone(otpPhone)
    if (phoneErr) {
      setErrors({ otpPhone: phoneErr })
      return
    }

    setSubmitting(true)
    try {
      const cleanPhone = normalizePhone(otpPhone)
      const data = await sendOtp(cleanPhone)
      setOtpSent(true)
      if (data?.otp) {
        setDevOtp(data.otp)
      }
      toast('Verification code sent to your mobile', 'success')
    } catch (err) {
      setErrors({ form: err.message || 'Failed to send OTP' })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // 2. OTP Flow: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setErrors({})

    if (!/^\d{4,6}$/.test(otpCode.trim())) {
      setErrors({ otpCode: 'Please enter the 4 to 6 digit code' })
      return
    }

    setSubmitting(true)
    try {
      const cleanPhone = normalizePhone(otpPhone)
      await verifyOtp(cleanPhone, otpCode.trim())
      try {
        await refreshCart()
      } catch {
        /* empty cart */
      }
      toast('Signed in successfully', 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setErrors({ form: err.message || 'Invalid or expired OTP' })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Customer Registration
  async function handleRegister(e) {
    e.preventDefault()
    setErrors({})

    const newErrors = {}
    const nameErr = validateRequired(regName, 'Name')
    if (nameErr) newErrors.regName = nameErr

    const phoneErr = validatePhone(regPhone)
    if (phoneErr) newErrors.regPhone = phoneErr

    const emailErr = validateEmail(regEmail, false)
    if (emailErr) newErrors.regEmail = emailErr

    const passErr = validatePassword(regPassword, true)
    if (passErr) newErrors.regPassword = passErr

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      const cleanPhone = normalizePhone(regPhone)
      await register({
        name: regName.trim(),
        phone: cleanPhone,
        email: regEmail.trim() || undefined,
        password: regPassword,
        role: 'customer',
      })

      // Immediately log in with the new credentials
      await login({ phone: cleanPhone, password: regPassword })
      toast('Account created! Welcome to Vendra', 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' })
      toast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-app max-w-xl py-14 animate-rise">
      {/* Brand & Heading */}
      <div className="text-center">
        <span className="font-sans text-3xl font-black tracking-tight text-[#0a0a0a]">
          Vendra
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#0a0a0a] sm:text-3xl">
          {tab === 'login'
            ? 'Sign in to your account'
            : tab === 'otp'
            ? 'Sign in with Mobile OTP'
            : 'Create your customer account'}
        </h1>
        <p className="mt-2 text-base text-[#575550]">
          Shop electronics, fashion, gourmet, and local stores in one place.
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-8 rounded-3xl border border-[#e7e5df] bg-white p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-3 rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-1 text-center mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login')
              setErrors({})
            }}
            className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
              tab === 'login'
                ? 'bg-white text-[#0a0a0a] shadow-sm'
                : 'text-[#737069] hover:text-[#0a0a0a]'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('otp')
              setErrors({})
            }}
            className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
              tab === 'otp'
                ? 'bg-white text-[#0a0a0a] shadow-sm'
                : 'text-[#737069] hover:text-[#0a0a0a]'
            }`}
          >
            Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register')
              setErrors({})
            }}
            className={`rounded-lg py-2 text-xs sm:text-sm font-semibold transition ${
              tab === 'register'
                ? 'bg-white text-[#0a0a0a] shadow-sm'
                : 'text-[#737069] hover:text-[#0a0a0a]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Global Error Banner */}
        {errors.form ? (
          <div className="mb-5 rounded-xl border border-[#ffcdd2] bg-[#fdeeed] p-3.5 text-sm font-medium text-[#b82828]">
            {errors.form}
          </div>
        ) : null}

        {/* Tab 1: Password Login */}
        {tab === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <Input
              label="Phone number or Email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 9876543210 or you@mail.com"
              error={errors.identifier}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your account password"
              error={errors.password}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-semibold mt-2"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        )}

        {/* Tab 2: OTP Login */}
        {tab === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  label="Registered Mobile Number"
                  type="tel"
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  error={errors.otpPhone}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 text-base font-semibold mt-2"
                  disabled={submitting}
                >
                  {submitting ? 'Sending code…' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="rounded-xl border border-[#e7e5df] bg-[#faf9f5] p-3 text-xs text-[#575550]">
                  Verification code sent to <strong>+91 {otpPhone}</strong>.{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false)
                      setDevOtp(null)
                    }}
                    className="font-bold underline ml-1"
                  >
                    Change number
                  </button>
                </div>

                {devOtp ? (
                  <div className="rounded-xl border border-[#c8e6c9] bg-[#edf7ed] p-3 text-xs text-[#1e7041]">
                    Dev OTP Helper: <strong>{devOtp}</strong>
                  </div>
                ) : null}

                <Input
                  label="Enter Verification Code"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  error={errors.otpCode}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full h-12 text-base font-semibold mt-2"
                  disabled={submitting}
                >
                  {submitting ? 'Verifying…' : 'Verify & Sign In'}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Tab 3: Customer Registration */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Ananya Patel"
              error={errors.regName}
              required
            />

            <Input
              label="Mobile Number"
              type="tel"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              placeholder="10-digit mobile number"
              error={errors.regPhone}
              required
            />

            <Input
              label="Email Address (Optional)"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="ananya@example.com"
              error={errors.regEmail}
            />

            <Input
              label="Choose Password"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              error={errors.regPassword}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-12 text-base font-semibold mt-2"
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Create Customer Account'}
            </Button>
          </form>
        )}

        {/* Seller Callout Box */}
        <div className="mt-8 rounded-2xl border border-[#e7e5df] bg-[#faf9f5] p-4 text-center">
          <p className="text-sm font-semibold text-[#0a0a0a]">Want to sell on Vendra?</p>
          <p className="mt-1 text-xs text-[#737069]">
            Register as a vendor to list your catalog, manage inventory, and receive customer orders.
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <Link
              to="/vendor/register"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0a0a0a] underline underline-offset-4"
            >
              <span>Register as a Vendor</span>
              <ArrowRight className="size-3" />
            </Link>
            <span className="text-xs text-[#99958d]">·</span>
            <Link
              to="/vendor/login"
              className="text-xs font-bold text-[#737069] hover:underline"
            >
              Vendor Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
