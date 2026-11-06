import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, UserRound, Tag } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const itemCount = useCartStore((s) => s.itemCount)

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-surface/95 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center gap-3 md:h-[72px] md:gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="font-display text-xl font-bold tracking-tight text-brand sm:inline">
            Vendra
          </span>
        </Link>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="ml-auto flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-line bg-paper/80 px-4 text-left text-sm text-muted transition hover:border-brand/40 md:max-w-md"
        >
          <Search className="size-4 shrink-0 text-muted" />
          <span className="truncate">Search products, brands and categories...</span>
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/search"
            className={({ isActive }) =>
              cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                isActive ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:bg-black/5',
              )
            }
          >
            Explore
          </NavLink>
          <NavLink
            to="/search?filter=deals"
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:bg-black/5"
          >
            <Tag className="size-3.5 text-ember" /> Deals
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(
                'rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                isActive ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:bg-black/5',
              )
            }
          >
            Orders
          </NavLink>
        </nav>

        <Link
          to="/cart"
          className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-line px-3.5 text-sm font-semibold text-ink transition hover:border-brand/40"
        >
          <ShoppingBag className="size-4 text-ink-soft" />
          <span className="hidden sm:inline">Cart</span>
          {itemCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white shadow-sm">
              {itemCount}
            </span>
          ) : null}
        </Link>

        {user ? (
          <Link
            to="/account"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-3.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            <UserRound className="size-4" />
            <span className="hidden max-w-[100px] truncate sm:inline">
              {user.name?.split(' ')[0] || 'Account'}
            </span>
          </Link>
        ) : (
          <Button size="sm" onClick={() => navigate('/login')}>
            Login
          </Button>
        )}
      </div>
    </header>
  )
}
