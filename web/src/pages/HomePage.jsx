import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  Store,
  Layers,
  Search,
  Star,
  CheckCircle2,
  Clock3,
} from 'lucide-react'
import { catalogApi, feedApi, restaurantsApi, vendorsApi } from '@/api'
import { ProductCard } from '@/components/commerce/ProductCard'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { resolveImage } from '@/utils/media'

export function HomePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [shops, setShops] = useState([])
  const [banners, setBanners] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      try {
        const [categoryList, productRes, nearbyRes, bannerList] = await Promise.allSettled([
          catalogApi.categories(),
          catalogApi.products({ limit: 12, sort: 'newest' }),
          restaurantsApi.nearby({ lat: 28.6139, lng: 77.209, radius: 15, limit: 6 }),
          feedApi.banners('ALL'),
        ])

        if (!active) return

        if (categoryList.status === 'fulfilled') {
          setCategories(categoryList.value || [])
        }
        if (productRes.status === 'fulfilled') {
          setProducts(productRes.value?.products || [])
        }
        if (nearbyRes.status === 'fulfilled') {
          setShops(nearbyRes.value?.restaurants || [])
        }
        if (bannerList.status === 'fulfilled') {
          setBanners(bannerList.value || [])
        }
      } catch (err) {
        if (active) setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/search')
    }
  }

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  return (
    <div className="animate-rise space-y-16 pb-20">
      {/* 1. Super Premium Hero Section */}
      <section className="border-b border-[#e7e5df] bg-[#ffffff] pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="container-app">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e7e5df] bg-[#faf9f5] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#121212]">
              <Sparkles className="size-3.5 text-[#a37237]" />
              The Multi-Vendor Marketplace
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-[#0a0a0a] sm:text-6xl md:leading-[1.1]">
              Independent Shops.<br />
              <span className="font-serif italic font-normal text-[#575550]">
                Every Category, Unified.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-[#575550] leading-relaxed">
              Explore curated electronics, apparel, living, and gourmet provisions from verified independent merchants.
            </p>

            {/* Quick Hero Search Input */}
            <form onSubmit={handleSearchSubmit} className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-[#121212] bg-[#ffffff] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
              <div className="flex flex-1 items-center gap-3 pl-3">
                <Search className="size-5 text-[#737069]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What are you shopping for today?"
                  className="w-full bg-transparent text-base text-[#121212] outline-none placeholder:text-[#99958d]"
                />
              </div>
              <Button type="submit" variant="primary" className="h-11 px-6 text-sm font-semibold">
                Explore
              </Button>
            </form>

            {/* Quick Navigation Chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-[#737069]">
              <span className="font-medium text-[#121212]">Popular:</span>
              <Link to="/categories" className="rounded-full border border-[#e7e5df] bg-[#faf9f5] px-3 py-1 hover:border-[#121212] hover:text-[#121212]">
                Category-Wise List
              </Link>
              <Link to="/shops" className="rounded-full border border-[#e7e5df] bg-[#faf9f5] px-3 py-1 hover:border-[#121212] hover:text-[#121212]">
                Verified Shops
              </Link>
              <Link to="/search?filter=deals" className="rounded-full border border-[#e7e5df] bg-[#faf9f5] px-3 py-1 hover:border-[#121212] hover:text-[#121212]">
                Steal Deals
              </Link>
              <Link to="/vendor/register" className="rounded-full border border-[#0a0a0a] bg-[#0a0a0a] px-3 py-1 font-semibold text-white hover:bg-[#262626]">
                Sell on Vendra
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Value Props */}
      <section className="container-app">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#e7e5df] bg-white p-6 md:grid-cols-4 md:p-8">
          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#faf9f5] text-[#121212] border border-[#e7e5df]">
              <Truck className="size-5" />
            </span>
            <div>
              <h4 className="text-base font-bold text-[#121212]">Fast Direct Delivery</h4>
              <p className="mt-0.5 text-xs text-[#737069]">Dispatched from verified vendors</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#faf9f5] text-[#121212] border border-[#e7e5df]">
              <Store className="size-5" />
            </span>
            <div>
              <h4 className="text-base font-bold text-[#121212]">Independent Merchants</h4>
              <p className="mt-0.5 text-xs text-[#737069]">Support certified local businesses</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#faf9f5] text-[#121212] border border-[#e7e5df]">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h4 className="text-base font-bold text-[#121212]">Guaranteed Quality</h4>
              <p className="mt-0.5 text-xs text-[#737069]">100% authentic multi-category items</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#faf9f5] text-[#121212] border border-[#e7e5df]">
              <Layers className="size-5" />
            </span>
            <div>
              <h4 className="text-base font-bold text-[#121212]">Unified Checkout</h4>
              <p className="mt-0.5 text-xs text-[#737069]">Seamless COD & payment security</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category-Wise Shopping Showcase */}
      <section className="container-app">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#737069]">
              Department Catalog
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#121212] hover:underline"
          >
            <span>View All Categories & Lists</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((cat) => (
              <Link
                key={cat._id || cat.id}
                to={`/categories?categoryId=${cat._id || cat.id}`}
                className="group warm-card flex flex-col overflow-hidden bg-white p-4 text-center transition hover:-translate-y-0.5"
              >
                <div className="mx-auto aspect-square w-full overflow-hidden rounded-xl bg-[#faf9f5] p-3 flex items-center justify-center">
                  {cat.image || cat.iconUrl ? (
                    <img
                      src={resolveImage(cat.image || cat.iconUrl)}
                      alt={cat.name}
                      className="size-full object-contain transition group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <Layers className="size-8 text-[#121212]" />
                  )}
                </div>
                <h3 className="mt-3 truncate text-sm font-bold text-[#121212] group-hover:text-[#42403c]">
                  {cat.name}
                </h3>
                <span className="mt-0.5 text-xs text-[#737069]">Shop list</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e7e5df] p-10 text-center">
            <Layers className="mx-auto size-8 text-[#737069]" />
            <p className="mt-3 text-base text-[#737069]">
              Categories are ready to browse. Check our product search.
            </p>
            <Link to="/search" className="mt-4 inline-block font-semibold text-[#121212] underline">
              Browse all items
            </Link>
          </div>
        )}
      </section>

      {/* 4. Shop-Wise Discovery Showcase */}
      <section className="container-app">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#737069]">
              Verified Merchants
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
              Shop by Store
            </h2>
          </div>
          <Link
            to="/shops"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#121212] hover:underline"
          >
            <span>Browse All Shops & Merchants</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {shops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.slice(0, 6).map((shop) => (
              <RestaurantCard key={shop._id || shop.id} restaurant={shop} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e7e5df] bg-white p-8 text-center">
            <Store className="mx-auto size-8 text-[#121212]" />
            <h3 className="mt-3 text-lg font-bold text-[#121212]">Partner Shops Nearby</h3>
            <p className="mt-1 text-base text-[#737069]">
              Discover local storefronts and boutiques delivering directly to your door.
            </p>
            <Link to="/shops" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-[#121212] underline">
              Explore Shop Directory <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </section>

      {/* 5. Featured Marketplace Products */}
      <section className="container-app">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#737069]">
              Handpicked Catalog
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#0a0a0a] sm:text-3xl">
              Featured Products
            </h2>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#121212] hover:underline"
          >
            <span>See Full Catalog</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e7e5df] bg-white p-12 text-center">
            <Search className="mx-auto size-8 text-[#737069]" />
            <p className="mt-3 text-base text-[#737069]">New arrivals are being added to the catalog.</p>
            <Link to="/search" className="mt-4 inline-block font-semibold text-[#121212] underline">
              Search all inventory
            </Link>
          </div>
        )}
      </section>

      {/* 6. Become a Vendor Call to Action */}
      <section className="container-app">
        <div className="relative overflow-hidden rounded-3xl border border-[#121212] bg-[#0a0a0a] p-8 text-white sm:p-12 md:p-16">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              <Store className="size-3.5" /> Seller Partnerships
            </span>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
              Grow Your Business on Vendra
            </h2>
            <p className="mt-4 text-base text-white/75 sm:text-lg leading-relaxed">
              Whether you run a boutique, an electronics store, a specialty grocery, or a gourmet eatery, Vendra provides direct access to customers with zero setup complexity.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/vendor/register')}
                className="bg-white text-[#0a0a0a] hover:bg-[#faf9f5]"
              >
                Register as a Vendor
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/vendor/login')}
                className="text-white hover:bg-white/10"
              >
                Vendor Sign in →
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
