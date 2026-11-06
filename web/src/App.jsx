import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { getAccessToken } from '@/api'
import { HomePage } from '@/pages/HomePage'
import { RestaurantPage } from '@/pages/RestaurantPage'
import { SearchPage } from '@/pages/SearchPage'
import { LoginPage } from '@/pages/LoginPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { AccountPage } from '@/pages/AccountPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { Spinner } from '@/components/ui/Spinner'

// Inner component — rendered inside BrowserRouter so hooks like useNavigate work
function AppRoutes() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const bootstrapped = useAuthStore((s) => s.bootstrapped)
  const user = useAuthStore((s) => s.user)
  const refreshCart = useCartStore((s) => s.refresh)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (bootstrapped && user && getAccessToken()) {
      refreshCart().catch(() => {})
    }
  }, [bootstrapped, user, refreshCart])

  if (!bootstrapped) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="restaurants/:id" element={<RestaurantPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
