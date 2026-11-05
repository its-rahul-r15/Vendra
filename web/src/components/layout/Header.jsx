import { Link, NavLink, useNavigate } from 'react-router-dom'
import { MapPin, Search, ShoppingBag, UserRound, Leaf } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useLocationStore } from '@/stores/location.store'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const itemCount = useCartStore((s) => s.itemCount)
  const location = useLocationStore((s) => s.location)
  const requestBrowserLocation = useLocationStore((s) => s.requestBrowserLocation)
  const vegOnly = useUiStore((s) => s.vegOnly)
  const setVegOnly = useUiStore((s) => s.setVegOnly)

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-surface/90 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center gap-3 md:h-[72px] md:gap-5">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/brand/ftafat-logo.png"
            alt="Ftafat"
            className="h-9 w-auto md:h-10"
          />
          <span className="hidden font-display text-2xl leading-none text-brand sm:inline">
            FTAFAT
          </span>
        </Link>

        <button
          type="button"
          onClick={() => requestBrowserLocation()}
          className="hidden min-w-0 max-w-[220px] items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-black/[0.03] md:flex"
        >
          <MapPin className="size-4 shrink-0 text-brand" />
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted">
              Delivering to
            </span>
            <span className="block truncate text-sm font-bold text-ink">
              {location.label || `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/search')}
          className="ml-auto flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-line bg-paper/70 px-3 text-left text-sm text-muted transition hover:border-brand/30 md:max-w-md"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search restaurants or dishes</span>
        </button>

        <button
          type="button"
          onClick={() => setVegOnly(!vegOnly)}
          className={cn(
            'hidden h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition lg:inline-flex',
            vegOnly
              ? 'border-veg/30 bg-veg/10 text-veg'
              : 'border-line bg-surface text-muted',
          )}
          aria-pressed={vegOnly}
        >
          <Leaf className="size-4" />
          Veg
        </button>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(
                'rounded-xl px-3 py-2 text-sm font-semibold transition',
                isActive ? 'bg-brand/10 text-brand' : 'text-ink-soft hover:bg-black/5',
              )
            }
          >
            Orders
          </NavLink>
        </nav>

        <Link
          to="/cart"
          className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-semibold text-ink transition hover:border-brand/30"
        >
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Cart</span>
          {itemCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
              {itemCount}
            </span>
          ) : null}
        </Link>

        {user ? (
          <Link
            to="/account"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-3 text-sm font-semibold text-white"
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
