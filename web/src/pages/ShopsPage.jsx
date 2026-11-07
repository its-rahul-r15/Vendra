import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Store, Search, ArrowRight, Sparkles } from 'lucide-react'
import { vendorsApi, restaurantsApi } from '@/api'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function ShopsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const vertical = searchParams.get('vertical') || ''
  const search = searchParams.get('q') || ''
  const isOpenFilter = searchParams.get('isOpen') || ''

  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    let active = true

    async function loadShops() {
      setLoading(true)
      try {
        const [vendorsRes, restsRes] = await Promise.allSettled([
          vendorsApi.list({
            vertical: vertical || undefined,
            isOpen: isOpenFilter ? isOpenFilter === 'true' : undefined,
            limit: 50,
          }),
          restaurantsApi.list({
            isActive: true,
            limit: 50,
          }),
        ])

        if (!active) return

        let combined = []

        if (vendorsRes.status === 'fulfilled' && vendorsRes.value?.vendors?.length) {
          combined = [...vendorsRes.value.vendors]
        }

        if (restsRes.status === 'fulfilled' && restsRes.value?.restaurants?.length) {
          const existingIds = new Set(combined.map((v) => String(v._id || v.id)))
          for (const rest of restsRes.value.restaurants) {
            const id = String(rest._id || rest.id)
            if (!existingIds.has(id)) {
              combined.push(rest)
            }
          }
        }

        // Apply client-side search query
        if (search.trim()) {
          const q = search.toLowerCase()
          combined = combined.filter((s) => {
            const name = (s.name || '').toLowerCase()
            const city = (s.address?.city || s.address?.line1 || '').toLowerCase()
            const cuisines = Array.isArray(s.cuisines)
              ? s.cuisines.join(' ').toLowerCase()
              : (s.cuisines || '').toLowerCase()
            return name.includes(q) || city.includes(q) || cuisines.includes(q)
          })
        }

        setShops(combined)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadShops()
    return () => {
      active = false
    }
  }, [vertical, search, isOpenFilter])

  function handleSearchSubmit(e) {
    e.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      next.set('q', searchInput.trim())
    } else {
      next.delete('q')
    }
    setSearchParams(next)
  }

  function setFilter(key, val) {
    const next = new URLSearchParams(searchParams)
    if (val) {
      next.set(key, val)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#120b0d] py-10 sm:py-14 animate-rise">
      <div className="container-app max-w-6xl">
        
        {/* ── 1. EDITORIAL HEADER ── */}
        <header className="pb-8 border-b border-black/[0.08] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#990024]">
              Merchant Directory
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#120b0d] tracking-tight">
              Verified Brand Stores
            </h1>
            <p className="text-xs sm:text-sm text-[#736c6e] font-medium max-w-xl">
              Explore certified independent merchants, artisan boutiques, and partner flagships.
            </p>
          </div>

          <Link
            to="/vendor/register"
            className="inline-flex items-center gap-2 rounded-full bg-[#120b0d] hover:bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-95"
          >
            <span>Partner With Vendra</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </header>

        {/* ── 2. BORDERLESS SEARCH BAR & MODERN MOOD PILLS (NO OUTLINE / NO RINGS) ── */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Pure Borderless & Clean Search Field */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex h-12 w-full sm:max-w-md items-center gap-3 rounded-2xl bg-white px-4 transition-all duration-200 shadow-sm"
          >
            <Search className="size-4 text-[#8c8587] shrink-0" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search store name, city, or specialty..."
              className="w-full bg-transparent text-xs font-semibold text-[#120b0d] placeholder:text-[#8c8587] focus:outline-none focus:ring-0 border-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setFilter('q', '')
                }}
                className="text-[11px] font-bold text-[#8c8587] hover:text-[#120b0d] cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>

          {/* Minimal Soft Category Pills (No Borders / Rings) */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {[
              { label: 'All Stores', val: '' },
              { label: 'Retail & Boutiques', val: 'commerce' },
              { label: 'Gourmet & Dining', val: 'food' },
              { label: 'Artisan & Groceries', val: 'grocery' },
            ].map((p) => {
              const active = vertical === p.val
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFilter('vertical', p.val)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#120b0d] text-white shadow-xs'
                      : 'bg-white text-[#736c6e] hover:text-[#120b0d] hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 3. STORE CARDS GRID WITH REAL PHOTOGRAPHY BANNERS ── */}
        <div className="mt-8">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner className="size-8 text-[#120b0d]" />
            </div>
          ) : !shops.length ? (
            <div className="rounded-2xl bg-white p-12 text-center space-y-3">
              <Store className="size-10 mx-auto text-[#8c8587]" />
              <h3 className="text-base font-black text-[#120b0d]">No stores match your search</h3>
              <p className="text-xs text-[#736c6e]">Try checking your spelling or clear filter pills.</p>
              <button
                onClick={() => {
                  setSearchInput('')
                  setSearchParams({})
                }}
                className="mt-2 rounded-full bg-[#120b0d] text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shops.map((shop) => (
                <RestaurantCard key={shop._id || shop.id} restaurant={shop} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
