import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, UserRound, Tag, Store, Layers, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const vendorStatus = useAuthStore((s) => s.vendorStatus)
  const itemCount = useCartStore((s) => s.itemCount)

  const isSeller = ['restaurant_owner', 'merchant_owner'].includes(user?.role) || vendorStatus === 'active_seller'

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e5df] bg-[#faf9f5]/95 backdrop-blur-md">
      <div className="container-app flex h-18 items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="font-sans text-2xl font-black tracking-tight text-[#0a0a0a]">
            Vendra
          </span>
          <span className="hidden sm:inline-block rounded-full bg-[#121212] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white">
            Marketplace
          </span>
        </Link>

        {/* Global Search Bar */}
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="hidden md:flex h-11 min-w-[260px] max-w-md flex-1 items-center gap-3 rounded-xl border border-[#e7e5df] bg-white px-4 text-left text-sm text-[#737069] transition hover:border-[#0a0a0a]"
        >
          <Search className="size-4 shrink-0 text-[#737069]" />
          <span className="truncate">Search products, stores & departments...</span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-[#121212] text-white'
                  : 'text-[#42403c] hover:bg-black/5 hover:text-[#121212]',
              )
            }
          >
            <Layers className="size-4" />
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/shops"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-[#121212] text-white'
                  : 'text-[#42403c] hover:bg-black/5 hover:text-[#121212]',
              )
            }
          >
            <Store className="size-4" />
            <span>Shops</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-[#121212] text-white'
                  : 'text-[#42403c] hover:bg-black/5 hover:text-[#121212]',
              )
            }
          >
            Explore
          </NavLink>

          <NavLink
            to="/search?filter=deals"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-[#121212] text-white'
                  : 'text-[#42403c] hover:bg-black/5 hover:text-[#121212]',
              )
            }
          >
            <Tag className="size-3.5 text-[#a37237]" />
            <span>Deals</span>
          </NavLink>

          {user ? (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-[#121212] text-white'
                    : 'text-[#42403c] hover:bg-black/5 hover:text-[#121212]',
                )
              }
            >
              Orders
            </NavLink>
          ) : null}

          {isSeller ? (
            <NavLink
              to="/vendor/dashboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-[#0a0a0a] text-white'
                    : 'text-[#121212] hover:bg-black/5',
                )
              }
            >
              <LayoutDashboard className="size-4 text-[#a37237]" />
              <span className="font-bold">Vendor Panel</span>
            </NavLink>
          ) : null}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {/* Vendor Register / Portal Button */}
          {isSeller ? (
            <Link
              to="/vendor/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#0a0a0a] bg-[#0a0a0a] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#262626]"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Vendor Panel</span>
            </Link>
          ) : (
            <Link
              to="/vendor/register"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#121212] bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#121212] transition hover:bg-[#121212] hover:text-white"
            >
              <span>Register as Vendor</span>
            </Link>
          )}

          {/* Cart Trigger */}
          <Link
            to="/cart"
            aria-label="View Shopping Cart"
            className="relative flex h-11 items-center gap-2 rounded-xl border border-[#e7e5df] bg-white px-3.5 text-sm font-medium text-[#121212] transition hover:border-[#121212]"
          >
            <ShoppingBag className="size-4.5 text-[#121212]" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-[#0a0a0a] px-1.5 text-[11px] font-bold text-white shadow-sm">
                {itemCount}
              </span>
            ) : null}
          </Link>

          {/* User Auth Trigger */}
          {user ? (
            <Link
              to="/account"
              className="flex h-11 items-center gap-2 rounded-xl bg-[#0a0a0a] px-4 text-sm font-medium text-white transition hover:bg-[#262626]"
            >
              <UserRound className="size-4" />
              <span className="max-w-[110px] truncate">
                {user.name?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          ) : (
            <Button
              size="md"
              variant="primary"
              onClick={() => navigate('/login')}
              className="h-11"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Quick Category Bar */}
      <div className="flex lg:hidden items-center gap-2 border-t border-[#e7e5df] px-4 py-2 overflow-x-auto hide-scrollbar bg-[#faf9f5]">
        <Link
          to="/categories"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white border border-[#e7e5df] text-[#121212]"
        >
          Categories
        </Link>
        <Link
          to="/shops"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white border border-[#e7e5df] text-[#121212]"
        >
          Shops
        </Link>
        <Link
          to="/search"
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white border border-[#e7e5df] text-[#121212]"
        >
          Explore
        </Link>
        {isSeller ? (
          <Link
            to="/vendor/dashboard"
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#0a0a0a] text-white ml-auto"
          >
            Vendor Panel
          </Link>
        ) : (
          <Link
            to="/vendor/register"
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[#0a0a0a] text-white ml-auto"
          >
            Sell
          </Link>
        )}
      </div>
    </header>
  )
}
