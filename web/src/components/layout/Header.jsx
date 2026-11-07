import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  UserRound,
  Store,
  Layers,
  LayoutDashboard,
  Gift,
  Heart,
  ChevronDown,
  Sparkles,
  Compass,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

const SUB_NAV_LINKS = [
  { label: 'Gifts & Hampers', path: '/categories?categoryId=gifts-festive-hampers', icon: Gift },
  { label: 'Fashion & Apparel', path: '/categories?vertical=commerce' },
  { label: 'Home & Living', path: '/categories?categoryId=home-living-decor' },
  { label: 'Artisan Kitchens', path: '/shops?vertical=food' },
  { label: 'Organic Pantry', path: '/categories?vertical=grocery' },
  { label: 'Jewellery', path: '/categories?categoryId=jewellery-watches' },
  { label: 'Deals of the Week', path: '/search?filter=deals' },
]

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const vendorStatus = useAuthStore((s) => s.vendorStatus)
  const itemCount = useCartStore((s) => s.itemCount)

  const [query, setQuery] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)

  const isSeller =
    ['restaurant_owner', 'merchant_owner'].includes(user?.role) ||
    vendorStatus === 'active_seller'

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      navigate('/search')
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e5df] bg-[#ffffff]/98 backdrop-blur-md">
      {/* ── Main Header Row ── */}
      <div className="container-app flex h-20 items-center justify-between gap-4 md:gap-6">
        {/* Brand Logo & Categories Button (Inspired by Etsy reference) */}
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-serif italic text-3xl md:text-4xl font-black tracking-tight text-[#0a0a0a]">
              Vendra
            </span>
          </Link>

          <Link
            to="/categories"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-[#0a0a0a] transition hover:bg-[#f4f2ec]"
          >
            <Layers className="size-4" />
            <span>Categories</span>
          </Link>
        </div>

        {/* Big Rounded Search Input with Pill Submit Button */}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 max-w-2xl items-center rounded-full border border-[#0a0a0a] bg-white p-1 shadow-sm transition focus-within:ring-2 focus-within:ring-[#0a0a0a]/15"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for unique items, independent shops, gifts..."
            className="w-full bg-transparent pl-4 pr-2 text-sm md:text-base text-[#0a0a0a] outline-none placeholder:text-[#8c887f]"
          />
          <button
            type="submit"
            aria-label="Search marketplace"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0a0a0a] text-white transition hover:bg-[#262626]"
          >
            <Search className="size-4.5" />
          </button>
        </form>

        {/* Right Actions: Seller CTA, Wishlist/Heart, Cart, Sign In */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Vendor Portal CTA */}
          {isSeller ? (
            <Link
              to="/vendor/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-[#0a0a0a] bg-[#0a0a0a] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#262626]"
            >
              <LayoutDashboard className="size-3.5" />
              <span>Vendor Panel</span>
            </Link>
          ) : (
            <Link
              to="/vendor/register"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-[#e7e5df] px-3.5 py-1.5 text-xs font-semibold text-[#4a4740] transition hover:border-[#0a0a0a] hover:text-[#0a0a0a]"
            >
              <span>Sell on Vendra</span>
            </Link>
          )}

          {/* Quick Shops Directory Link */}
          <Link
            to="/shops"
            className="hidden md:inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-[#4a4740] hover:text-[#0a0a0a] hover:bg-[#f4f2ec]"
          >
            <Store className="size-4" />
            <span>Shops</span>
          </Link>

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            aria-label="View Shopping Cart"
            className="relative grid size-10 place-items-center rounded-full hover:bg-[#f4f2ec] transition text-[#0a0a0a]"
          >
            <ShoppingBag className="size-5.5" />
            {itemCount > 0 ? (
              <span className="absolute 0 top-0.5 right-0.5 grid min-w-4.5 h-4.5 place-items-center rounded-full bg-[#0a0a0a] px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          {/* User Sign In / Profile */}
          {user ? (
            <Link
              to="/account"
              className="flex items-center gap-2 rounded-full border border-[#e7e5df] bg-white px-3.5 py-1.5 text-sm font-medium text-[#0a0a0a] hover:border-[#0a0a0a] transition"
            >
              <UserRound className="size-4" />
              <span className="max-w-[100px] truncate">
                {user.name?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="rounded-full px-4 text-xs font-bold uppercase tracking-wider h-9"
            >
              Sign in
            </Button>
          )}
        </div>
      </div>

      {/* ── Sub-Navigation Department Ribbon (Matching Etsy Reference) ── */}
      <div className="border-t border-[#e7e5df] bg-[#ffffff]">
        <div className="container-app flex items-center justify-between gap-6 overflow-x-auto py-2.5 hide-scrollbar text-xs md:text-sm font-medium text-[#4a4740]">
          <div className="flex items-center gap-6 shrink-0">
            {SUB_NAV_LINKS.map((item, idx) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={idx}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 py-1 whitespace-nowrap transition hover:text-[#0a0a0a]',
                      isActive
                        ? 'font-bold text-[#0a0a0a] border-b-2 border-[#0a0a0a]'
                        : 'text-[#5a574f]',
                    )
                  }
                >
                  {Icon ? <Icon className="size-3.5 text-[#0a0a0a]" /> : null}
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </div>

          <Link
            to="/categories"
            className="shrink-0 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:underline"
          >
            All Departments →
          </Link>
        </div>
      </div>
    </header>
  )
}
