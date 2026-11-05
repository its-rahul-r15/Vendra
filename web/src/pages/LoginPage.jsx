import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const sendOtp = useAuthStore((s) => s.sendOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const loading = useAuthStore((s) => s.loading)
  const refreshCart = useCartStore((s) => s.refresh)
  const toast = useUiStore((s) => s.toast)

  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(null)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from || '/'

  async function handleSend(e) {
    e.preventDefault()
    setError('')
    const normalized = normalizePhone(phone)
    if (normalized.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      return
    }
    try {
      const data = await sendOtp(normalized)
      setPhone(normalized)
      setDevOtp(data?.otp || null)
      setStep('otp')
      toast('OTP sent', 'success')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    if (!/^\d{4,6}$/.test(otp)) {
      setError('Enter the OTP you received')
      return
    }
    try {
      await verifyOtp(phone, otp)
      try {
        await refreshCart()
      } catch {
        /* cart may be empty */
      }
      toast('Welcome back', 'success')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container-app grid min-h-[70vh] items-center gap-10 py-10 md:grid-cols-2">
      <div className="relative hidden overflow-hidden rounded-[28px] brand-gradient p-8 text-white md:block">
        <img
          src="/brand/pizza.png"
          alt=""
          className="pointer-events-none absolute -right-6 bottom-0 w-56 opacity-95"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
          One number. Hot food.
        </p>
        <h1 className="mt-4 max-w-sm font-display text-6xl leading-none tracking-wide">
          Login & order in under a minute
        </h1>
        <p className="mt-4 max-w-sm text-white/75">
          We use OTP so you never have to remember another password on a hungry evening.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-3xl border border-line noise-panel p-6 shadow-[0_20px_60px_rgba(20,20,20,0.06)] md:p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <img src="/brand/ftafat-logo.png" alt="Ftafat" className="h-9" />
          <span className="font-display text-2xl text-brand">FTAFAT</span>
        </Link>

        <h2 className="text-2xl font-bold text-ink">
          {step === 'phone' ? 'Enter mobile number' : 'Verify OTP'}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {step === 'phone'
            ? 'We will send a one-time password via SMS / WhatsApp.'
            : `Sent to +91 ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSend} className="mt-6 space-y-4">
            <Input
              label="Mobile"
              inputMode="numeric"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-4">
            <Input
              label="OTP"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={error}
            />
            {devOtp ? (
              <p className="rounded-xl bg-paper px-3 py-2 text-xs text-muted">
                Dev OTP: <span className="font-bold text-ink">{devOtp}</span>
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Continue'}
            </Button>
            <button
              type="button"
              className="w-full text-sm font-semibold text-brand"
              onClick={() => {
                setStep('phone')
                setOtp('')
                setError('')
              }}
            >
              Change number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
