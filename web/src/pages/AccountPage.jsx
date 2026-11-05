import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useUiStore } from '@/stores/ui.store'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

export function AccountPage() {
  const { ready, user } = useRequireAuth()
  const logout = useAuthStore((s) => s.logout)
  const setUser = useAuthStore((s) => s.setUser)
  const toast = useUiStore((s) => s.toast)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [addresses, setAddresses] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    setName(user.name || '')
    setEmail(user.email || '')
    usersApi.addresses().then(setAddresses).catch(() => setAddresses([]))
  }, [user])

  if (!ready) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await usersApi.updateMe({ name, email: email || undefined })
      setUser(updated)
      toast('Profile updated', 'success')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container-app max-w-2xl space-y-6 py-8 animate-rise">
      <div className="rounded-3xl border border-line noise-panel p-5 md:p-6">
        <h1 className="font-display text-4xl tracking-wide">Account</h1>
        <p className="mt-1 text-sm text-muted">{user?.phone}</p>

        <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="sm:col-span-2" disabled={saving}>
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </form>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-5 md:p-6">
        <h2 className="text-lg font-bold">Saved addresses</h2>
        <div className="mt-4 space-y-3">
          {addresses.map((address) => (
            <div
              key={address._id || address.id}
              className="rounded-2xl border border-line p-4 text-sm"
            >
              <p className="font-bold">{address.label || 'Address'}</p>
              <p className="mt-1 text-muted">
                {address.line1}, {address.city}, {address.state} — {address.pincode}
              </p>
            </div>
          ))}
          {!addresses.length ? (
            <p className="text-sm text-muted">No addresses yet. Add one at checkout.</p>
          ) : null}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={async () => {
          await logout()
          toast('Logged out', 'info')
          navigate('/')
        }}
      >
        Log out
      </Button>
    </div>
  )
}
