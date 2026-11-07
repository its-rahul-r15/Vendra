import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDock } from '@/components/layout/CartDock'
import { Toaster } from '@/components/ui/Toaster'

export function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const hideDock = pathname.startsWith('/cart') || pathname.startsWith('/checkout')

  return (
    <div className="flex min-h-dvh flex-col bg-[#fcfbfa] text-[#120b0d]">
      <Header />
      <main className={`flex-1 ${isHome ? 'pt-0 pb-0' : 'pt-20 sm:pt-24 pb-24'}`}>
        <Outlet />
      </main>
      <Footer />
      {!hideDock ? <CartDock /> : null}
      <Toaster />
    </div>
  )
}
