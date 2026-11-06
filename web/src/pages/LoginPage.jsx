import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  return digits
}

/** Decode a Google JWT credential (base64url) without verifying signature (backend verifies) */
function decodeGoogleJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const sendOtp = useAuthStore((s) => s.sendOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const loading = useAuthStore((s) => s.loading)
  const refreshCart = useCartStore((s) => s.refresh)
  const toast = useUiStore((s) => s.toast)

  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [devOtp, setDevOtp] = useState(null)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from || '/'

  const handleGoogleSuccess = useCallback(
    async (response) => {
      setError('')
      try {
        const decoded = decodeGoogleJwt(response.credential)
        if (!decoded) throw new Error('Could not decode Google credential')

        await loginWithGoogle({
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.picture,
          googleId: decoded.sub,
        })
        try {
          await refreshCart()
        } catch {
          /* cart may be empty */
        }
        toast('Welcome! Logged in with Google', 'success')
        navigate(redirectTo, { replace: true })
      } catch (err) {
        setError(err.message || 'Google login failed. Please try again.')
      }
    },
    [loginWithGoogle, refreshCart, toast, navigate, redirectTo],
  )

  // Load Google Identity Services script and initialize
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const scriptId = 'google-gsi-script'
    if (document.getElementById(scriptId)) {
      initGoogle()
      return
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)

    function initGoogle() {
      if (!window.google?.accounts?.id) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSuccess,
        auto_select: false,
        cancel_on_tap_outside: true,
      })
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          width: '100%',
        },
      )
    }

    return () => {
      window.google?.accounts?.id?.cancel()
    }
  }, [handleGoogleSuccess])

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
          One click. Everything delivered.
        </p>
        <h1 className="mt-4 max-w-sm font-display text-6xl leading-none tracking-wide">
          Login &amp; shop in seconds
        </h1>
        <p className="mt-4 max-w-sm text-white/75">
          We use OTP so you never have to remember another password.
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-3xl border border-line noise-panel p-6 shadow-[0_20px_60px_rgba(20,20,20,0.06)] md:p-8">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <img src="/brand/ftafat-logo.png" alt="Vendra" className="h-9" />
          <span className="font-display text-2xl text-brand">VENDRA</span>
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
              {loading ? 'Sendingâ€¦' : 'Send OTP'}
            </Button>

            {/* Google Login */}
            {GOOGLE_CLIENT_ID ? (
              <>
                <div className="relative flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>
                <div id="google-btn-container" className="flex justify-center" />
              </>
            ) : null}
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
              {loading ? 'Verifyingâ€¦' : 'Continue'}
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

