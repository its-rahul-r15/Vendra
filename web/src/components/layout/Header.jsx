import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  Store,
  User,
  X,
  Truck,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const itemCount = useCartStore((s) => s.itemCount)

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Track scroll position to adapt navbar from Hero Carmine to Light Theme
  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 80) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHomePage = location.pathname === '/'
  // When at top of homepage, navbar is floating translucent on top of Carmine hero
  const isHeroTheme = isHomePage && !scrolled

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
    } else {
      navigate('/search')
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHeroTheme
          ? 'bg-transparent text-white py-4 sm:py-5'
          : 'bg-[#fcfbfa]/95 backdrop-blur-md text-[#120b0d] py-3 shadow-xs'
      }`}
    >
      <div className="container-app flex items-center justify-between gap-4">
        
        {/* Brand Logo (Minimalist Geometric Mark Inspired by Reference) */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div
            className={`size-9 rounded-full flex items-center justify-center transition-all ${
              isHeroTheme
                ? 'bg-white text-[#990024] shadow-md group-hover:scale-105'
                : 'bg-[#990024] text-white shadow-sm shadow-red-950/20 group-hover:scale-105'
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current" stroke="none">
              <circle cx="12" cy="12" r="3" />
              <circle cx="12" cy="4" r="2" />
              <circle cx="12" cy="20" r="2" />
              <circle cx="4" cy="12" r="2" />
              <circle cx="20" cy="12" r="2" />
              <circle cx="6.34" cy="6.34" r="1.6" />
              <circle cx="17.66" cy="17.66" r="1.6" />
              <circle cx="6.34" cy="17.66" r="1.6" />
              <circle cx="17.66" cy="6.34" r="1.6" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tight tracking-[-0.04em]">
            vendra
          </span>
        </Link>

        {/* Center Navigation Capsule (Matching reference: Products | Stores | Curations) */}
        <nav
          className={`hidden md:flex items-center gap-1 rounded-full p-1.5 transition-all text-xs font-bold ${
            isHeroTheme
              ? 'bg-black/25 text-white/90 backdrop-blur-md'
              : 'bg-[#f4f2ee] text-[#5c5658]'
          }`}
        >
          <Link
            to="/categories"
            className={`rounded-full px-5 py-2 transition-all ${
              location.pathname === '/categories'
                ? isHeroTheme
                  ? 'bg-white text-[#990024] shadow-xs'
                  : 'bg-white text-[#120b0d] shadow-xs'
                : isHeroTheme
                ? 'hover:text-white'
                : 'hover:text-[#120b0d]'
            }`}
          >
            Products
          </Link>
          <Link
            to="/shops"
            className={`rounded-full px-5 py-2 transition-all ${
              location.pathname === '/shops'
                ? isHeroTheme
                  ? 'bg-white text-[#990024] shadow-xs'
                  : 'bg-white text-[#120b0d] shadow-xs'
                : isHeroTheme
                ? 'hover:text-white'
                : 'hover:text-[#120b0d]'
            }`}
          >
            Stores
          </Link>
          <Link
            to="/search?filter=deals"
            className={`rounded-full px-5 py-2 transition-all ${
              location.search.includes('deals')
                ? isHeroTheme
                  ? 'bg-white text-[#990024] shadow-xs'
                  : 'bg-white text-[#120b0d] shadow-xs'
                : isHeroTheme
                ? 'hover:text-white'
                : 'hover:text-[#120b0d]'
            }`}
          >
            Curations
          </Link>
        </nav>

        {/* Right Action Icons (Search, User, Cart) */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Search Trigger / Pill */}
          {searchOpen ? (
            <form
              onSubmit={handleSearch}
              className={`flex items-center rounded-full px-3 py-1.5 shadow-sm transition-all w-[85vw] max-w-[260px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] ${
                isHeroTheme
                  ? 'bg-white text-[#120b0d]'
                  : 'bg-[#f4f2ee] text-[#120b0d]'
              }`}
            >
              <Search className="size-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-transparent px-2 text-xs font-bold outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className={`grid size-10 place-items-center rounded-full transition-all cursor-pointer ${
                isHeroTheme
                  ? 'bg-black/20 hover:bg-black/30 text-white backdrop-blur-md'
                  : 'bg-[#f4f2ee] hover:bg-[#e8e6e0] text-[#120b0d]'
              }`}
              title="Search"
            >
              <Search className="size-4" />
            </button>
          )}

          {/* User Account Circle */}
          {user ? (
            <Link
              to="/account"
              className={`grid size-10 place-items-center rounded-full font-black text-xs transition-all ${
                isHeroTheme
                  ? 'bg-black/20 hover:bg-white hover:text-[#990024] text-white backdrop-blur-md'
                  : 'bg-[#f4f2ee] hover:bg-[#990024] hover:text-white text-[#120b0d]'
              }`}
              title="My Account"
            >
              <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className={`grid size-10 place-items-center rounded-full transition-all ${
                isHeroTheme
                  ? 'bg-black/20 hover:bg-white hover:text-[#990024] text-white backdrop-blur-md'
                  : 'bg-[#f4f2ee] hover:bg-[#990024] hover:text-white text-[#120b0d]'
              }`}
              title="Sign In"
            >
              <User className="size-4" />
            </Link>
          )}

          {/* Cart Icon Capsule with Count Badge (Matches Reference Top Right Style) */}
          <Link
            to="/cart"
            aria-label="View Shopping Cart"
            className={`relative grid size-10 place-items-center rounded-full transition-all shadow-sm ${
              isHeroTheme
                ? 'bg-white text-[#990024] hover:bg-slate-100'
                : 'bg-[#120b0d] text-white hover:bg-[#990024]'
            }`}
          >
            <ShoppingBag className="size-4.5" />
            {itemCount > 0 ? (
              <span
                className={`absolute -top-1 -right-1 grid min-w-4.5 h-4.5 place-items-center rounded-full px-1 text-[10px] font-black shadow-xs ${
                  isHeroTheme
                    ? 'bg-[#120b0d] text-white'
                    : 'bg-[#990024] text-white'
                }`}
              >
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>
    </header>
  )
}
