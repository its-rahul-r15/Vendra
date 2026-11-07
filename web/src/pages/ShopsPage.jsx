import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Store, Search, Filter, Star, Clock3, MapPin, ArrowRight } from 'lucide-react'
import { vendorsApi, restaurantsApi } from '@/api'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

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
        // Query both vendors and restaurants for comprehensive multi-category coverage
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
          // Merge avoiding duplicates by id
          const existingIds = new Set(combined.map((v) => String(v._id || v.id)))
          for (const rest of restsRes.value.restaurants) {
            const id = String(rest._id || rest.id)
            if (!existingIds.has(id)) {
              combined.push(rest)
            }
          }
        }

        // Apply client-side search filter if provided
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
    <div className="container-app py-10 animate-rise">
      {/* Header */}
      <div className="pb-4 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#737069]">
              <Store className="size-4" />
              Merchant Directory
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#dc2626] sm:text-4xl">
              Shop-Wise Directory
            </h1>
            <p className="mt-2 text-base text-[#575550]">
              Discover independent boutiques, retail stores, gourmet kitchens, and certified vendors.
            </p>
          </div>

          <Link
            to="/vendor/register"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#dc2626] px-5 text-sm font-semibold text-white transition hover:bg-[#262626]"
          >
            <span>Register as a Vendor</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex h-11 w-full sm:max-w-md items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 transition focus-within:border-[#dc2626]"
          >
            <Search className="size-4 text-[#737069]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by store name, locality, or specialty..."
              className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#99958d]"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setFilter('q', '')
                }}
                className="text-xs text-[#737069] hover:text-[#dc2626]"
              >
                Clear
              </button>
            ) : null}
          </form>

          {/* Vertical filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilter('vertical', '')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                !vertical
                  ? 'bg-[#dc2626] text-white'
                  : 'border border-slate-100 bg-white text-[#42403c] hover:border-[#dc2626]'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setFilter('vertical', 'food')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                vertical === 'food'
                  ? 'bg-[#dc2626] text-white'
                  : 'border border-slate-100 bg-white text-[#42403c] hover:border-[#dc2626]'
              }`}
            >
              Gourmet & Dining
            </button>
            <button
              type="button"
              onClick={() => setFilter('vertical', 'grocery')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                vertical === 'grocery'
                  ? 'bg-[#dc2626] text-white'
                  : 'border border-slate-100 bg-white text-[#42403c] hover:border-[#dc2626]'
              }`}
            >
              Groceries & Essentials
            </button>
            <button
              type="button"
              onClick={() => setFilter('vertical', 'commerce')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                vertical === 'commerce'
                  ? 'bg-[#dc2626] text-white'
                  : 'border border-slate-100 bg-white text-[#42403c] hover:border-[#dc2626]'
              }`}
            >
              Retail & Boutiques
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Stores */}
      <div className="mt-8">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner className="size-8 text-[#dc2626]" />
          </div>
        ) : !shops.length ? (
          <EmptyState
            title="No shops match your query"
            description="Try modifying your search or view all partner stores."
            actionLabel="Reset filters"
            onAction={() => {
              setSearchInput('')
              setSearchParams({})
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <RestaurantCard key={shop._id || shop.id} restaurant={shop} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

