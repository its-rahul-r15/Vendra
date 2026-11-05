import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'

export function useRequireAuth() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const bootstrapped = useAuthStore((s) => s.bootstrapped)

  useEffect(() => {
    if (bootstrapped && !user) {
      navigate('/login', { replace: true, state: { from: location.pathname } })
    }
  }, [bootstrapped, user, navigate, location.pathname])

  return { user, ready: bootstrapped && !!user }
}
