import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { getAccessToken } from '@/api'
import { HomePage } from '@/pages/HomePage'
import { CategoriesPage } from '@/pages/CategoriesPage'
import { ShopsPage } from '@/pages/ShopsPage'
import { ShopDetailPage } from '@/pages/ShopDetailPage'
import { ProductPage } from '@/pages/ProductPage'
import { SearchPage } from '@/pages/SearchPage'
import { LoginPage } from '@/pages/LoginPage'
import { VendorRegisterPage } from '@/pages/VendorRegisterPage'
import { VendorLoginPage } from '@/pages/VendorLoginPage'
import { VendorDashboardPage } from '@/pages/VendorDashboardPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { AccountPage } from '@/pages/AccountPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

function AppRoutes() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const bootstrapped = useAuthStore((s) => s.bootstrapped)
  const user = useAuthStore((s) => s.user)
  const refreshCart = useCartStore((s) => s.refresh)
  const [appMounted, setAppMounted] = useState(false)

  useEffect(() => {
    bootstrap().finally(() => {
      setAppMounted(true)
    })
  }, [bootstrap])

  useEffect(() => {
    if (bootstrapped && user && getAccessToken()) {
      refreshCart().catch(() => {})
    }
  }, [bootstrapped, user, refreshCart])

  return (
    <>
      <SplashScreen isReady={bootstrapped || appMounted} />
      <Routes>
        <Route element={<AppLayout />}>
          {/* Marketplace Core & Discovery */}
          <Route index element={<HomePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shops/:id" element={<ShopDetailPage />} />
          <Route path="restaurants/:id" element={<ShopDetailPage />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchPage />} />

        {/* Customer Commerce Flow */}
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="account" element={<AccountPage />} />

        {/* Vendor Portal & Authentication */}
        <Route path="login" element={<LoginPage />} />
        <Route path="vendor/register" element={<VendorRegisterPage />} />
        <Route path="vendor/login" element={<VendorLoginPage />} />
        <Route path="vendor/dashboard" element={<VendorDashboardPage />} />
        <Route path="vendor" element={<Navigate to="/vendor/dashboard" replace />} />

        {/* Redirects & 404 */}
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  )
}
