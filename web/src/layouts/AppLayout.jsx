import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDock } from '@/components/layout/CartDock'
import { Toaster } from '@/components/ui/Toaster'

export function AppLayout() {
  const { pathname } = useLocation()
  const hideDock = pathname.startsWith('/cart') || pathname.startsWith('/checkout')

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <Footer />
      {!hideDock ? <CartDock /> : null}
      <Toaster />
    </div>
  )
}
