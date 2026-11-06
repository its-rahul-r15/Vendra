import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, SlidersHorizontal, Store, Layers, ArrowRight } from 'lucide-react'
import { catalogApi, restaurantsApi } from '@/api'
import { ProductCard } from '@/components/commerce/ProductCard'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTab, setSearchTab] = useState('products') // 'products' | 'shops'

  const categoryId = params.get('categoryId') || ''
  const sort = params.get('sort') || 'newest'
  const filter = params.get('filter') || ''

  useEffect(() => {
    catalogApi.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')

      const next = new URLSearchParams(params)
      if (query.trim()) next.set('q', query.trim())
      else next.delete('q')
      setParams(next, { replace: true })

      Promise.allSettled([
        catalogApi.products({
          q: query.trim() || undefined,
          categoryId: categoryId || undefined,
          sort,
          limit: 60,
        }),
        restaurantsApi.list({
          search: query.trim() || undefined,
          limit: 20,
        }),
      ])
        .then(([prodRes, shopRes]) => {
          if (!active) return
          if (prodRes.status === 'fulfilled') {
            setProducts(prodRes.value?.products || [])
          }
          if (shopRes.status === 'fulfilled') {
            setShops(shopRes.value?.restaurants || [])
          }
        })
        .catch((err) => {
          if (active) setError(err.message)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 200)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, categoryId, sort, filter, setParams])

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="container-app py-10 animate-rise">
      {/* Search Header */}
      <div className="border-b border-[#e7e5df] pb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#737069]">
          Marketplace Search
        </span>
        <h1 className="mt-2 text-3xl font-black text-[#0a0a0a] sm:text-4xl">
          Search Products & Independent Stores
        </h1>

        <div className="relative mt-6 max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#737069]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all categories, brands, foods, and shops…"
            className="h-13 w-full rounded-2xl border border-[#121212] bg-white pl-12 pr-4 text-base text-[#121212] outline-none shadow-sm transition placeholder:text-[#99958d] focus:ring-2 focus:ring-[#121212]/10"
          />
        </div>

        {/* Filters and Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center rounded-xl border border-[#e7e5df] bg-white p-1">
            <button
              type="button"
              onClick={() => setSearchTab('products')}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                searchTab === 'products'
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#575550] hover:text-[#0a0a0a]'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSearchTab('shops')}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                searchTab === 'shops'
                  ? 'bg-[#0a0a0a] text-white'
                  : 'text-[#575550] hover:text-[#0a0a0a]'
              }`}
            >
              Shops & Merchants ({shops.length})
            </button>
          </div>

          {searchTab === 'products' ? (
            <div className="flex items-center gap-3">
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="h-10 rounded-xl border border-[#e7e5df] bg-white px-3 text-sm font-medium text-[#121212] outline-none focus:border-[#0a0a0a]"
              >
                <option value="newest">Featured & Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          ) : null}
        </div>

        {/* Category Horizontal Filter */}
        {searchTab === 'products' && categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateParam('categoryId', '')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                !categoryId
                  ? 'bg-[#0a0a0a] text-white'
                  : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id || cat.id}
                type="button"
                onClick={() =>
                  updateParam('categoryId', categoryId === cat._id ? '' : cat._id)
                }
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  categoryId === cat._id
                    ? 'bg-[#0a0a0a] text-white'
                    : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Results View */}
      <div className="mt-8">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner className="size-8 text-[#0a0a0a]" />
          </div>
        ) : error ? (
          <EmptyState
            title="Search is currently unavailable"
            description={error}
            actionLabel="Try again"
            onAction={() => window.location.reload()}
          />
        ) : searchTab === 'products' ? (
          products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products match your search"
              description="Try adjusting your keywords or browse all categories."
              actionLabel="Clear search"
              onAction={() => {
                setQuery('')
                setParams({})
              }}
            />
          )
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop) => (
              <RestaurantCard key={shop._id || shop.id} restaurant={shop} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No shops match your search"
            description="Try searching for a different locality, restaurant, or store name."
            actionLabel="Clear search"
            onAction={() => {
              setQuery('')
              setParams({})
            }}
          />
        )}
      </div>
    </div>
  )
}
