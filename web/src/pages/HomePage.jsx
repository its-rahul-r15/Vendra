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
  Gift,
  Heart,
  Tag,
  Clock,
  Compass,
} from 'lucide-react'
import { catalogApi, feedApi, restaurantsApi } from '@/api'
import { ProductCard } from '@/components/commerce/ProductCard'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { resolveImage } from '@/utils/media'

export function HomePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      try {
        const [categoryList, productRes, nearbyRes] = await Promise.allSettled([
          catalogApi.categories(),
          catalogApi.products({ limit: 12, sort: 'newest' }),
          restaurantsApi.nearby({ lat: 28.6139, lng: 77.209, radius: 25, limit: 6 }),
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
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  return (
    <div className="animate-rise space-y-16 pb-24">
      {/* ── 1. Hero Editorial Collab Banner (Matching Attached Screenshot Reference) ── */}
      <section className="container-app pt-6 md:pt-8">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] items-stretch">
          {/* Main Large Editorial Card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] text-white min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-8 sm:p-12 shadow-sm">
            {/* Background Image with Cinematic Gradient */}
            <img
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1400&q=85"
              alt="Editorial Banner"
              className="absolute inset-0 size-full object-cover opacity-80 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="size-3.5 text-amber-300" />
                Featured Editorial Curation
              </span>
              <h1 className="mt-4 text-3xl font-serif italic tracking-tight text-white sm:text-5xl md:text-6xl font-normal leading-[1.08]">
                Celebrate the season with artisan craft.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/80 max-w-md">
                Discover independent makers, handmade ceramics, boutique fashion, and gourmet holiday provisions.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/categories')}
                  className="rounded-full bg-white text-[#0a0a0a] hover:bg-[#faf9f5] font-bold text-xs uppercase tracking-wider px-6 h-11"
                >
                  Shop the collection
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/shops')}
                  className="rounded-full border-white/60 text-white hover:bg-white/10 text-xs font-semibold px-5 h-11"
                >
                  Meet the makers
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: 2 Featured Editorial Tiles with Price Tags (Etsy Style) */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Top Tile */}
            <Link
              to="/categories?categoryId=gifts-festive-hampers"
              className="group relative overflow-hidden rounded-3xl bg-[#f4f2ec] border border-[#e7e5df] p-6 flex flex-col justify-between transition hover:border-[#0a0a0a]"
            >
              <img
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd45?w=700&q=80"
                alt="Festive Wrap Set"
                className="absolute inset-0 size-full object-cover transition group-hover:scale-105 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="relative z-10 flex justify-end">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#0a0a0a] shadow-sm">
                  From ₹1,299
                </span>
              </div>

              <div className="relative z-10 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Gifting Sets
                </span>
                <h3 className="mt-1 text-xl font-bold font-serif italic text-white">
                  Handcrafted Gift Packs
                </h3>
              </div>
            </Link>

            {/* Bottom Tile */}
            <Link
              to="/categories?categoryId=home-living-decor"
              className="group relative overflow-hidden rounded-3xl bg-[#f4f2ec] border border-[#e7e5df] p-6 flex flex-col justify-between transition hover:border-[#0a0a0a]"
            >
              <img
                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=80"
                alt="Bespoke Ceramics"
                className="absolute inset-0 size-full object-cover transition group-hover:scale-105 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="relative z-10 flex justify-end">
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-[#0a0a0a] shadow-sm">
                  From ₹799
                </span>
              </div>

              <div className="relative z-10 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">
                  Home Living
                </span>
                <h3 className="mt-1 text-xl font-bold font-serif italic text-white">
                  Minimalist Home Decor
                </h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Explore by Interest / Category Pills Section (Etsy Section Style) ── */}
      <section className="container-app">
        <div className="flex items-center justify-between border-b border-[#e7e5df] pb-4">
          <div>
            <h2 className="text-2xl font-serif italic font-black text-[#0a0a0a] sm:text-3xl">
              Explore by Department & Interest
            </h2>
            <p className="mt-1 text-sm text-[#575550]">
              Handcrafted items, retail boutiques, and gourmet kitchens curated category-wise.
            </p>
          </div>
          <Link
            to="/categories"
            className="rounded-full border border-[#0a0a0a] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white transition"
          >
            View all
          </Link>
        </div>

        {/* Circular / Rounded Category Avatars */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat._id || cat.slug || cat.name}
              to={`/categories?categoryId=${cat._id || cat.slug}`}
              className="group flex flex-col items-center text-center p-3 rounded-2xl transition hover:bg-white"
            >
              <div className="relative size-24 sm:size-28 overflow-hidden rounded-full border border-[#e7e5df] bg-[#f4f2ec] p-1 transition group-hover:scale-105 duration-300">
                <img
                  src={resolveImage(cat.image || cat.iconUrl)}
                  alt={cat.name}
                  className="size-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="mt-3 text-sm font-bold text-[#0a0a0a] group-hover:underline">
                {cat.name}
              </h3>
              <span className="text-[11px] text-[#737069]">Shop now</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. Handpicked Marketplace Products ── */}
      <section className="container-app">
        <div className="flex items-center justify-between border-b border-[#e7e5df] pb-4">
          <div>
            <h2 className="text-2xl font-serif italic font-black text-[#0a0a0a] sm:text-3xl">
              Fresh Discoveries Today
            </h2>
            <p className="mt-1 text-sm text-[#575550]">
              Unique pieces directly from independent creators and certified shops.
            </p>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:underline"
          >
            See full catalog →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-[#e7e5df] p-12 text-center">
            <Search className="mx-auto size-8 text-[#737069]" />
            <p className="mt-3 text-sm text-[#737069]">Catalog items are being updated.</p>
          </div>
        )}
      </section>

      {/* ── 4. Independent Verified Shops ── */}
      <section className="container-app">
        <div className="flex items-center justify-between border-b border-[#e7e5df] pb-4">
          <div>
            <h2 className="text-2xl font-serif italic font-black text-[#0a0a0a] sm:text-3xl">
              Shops You Might Love
            </h2>
            <p className="mt-1 text-sm text-[#575550]">
              Support independent boutiques, family kitchens, and verified local retailers.
            </p>
          </div>
          <Link
            to="/shops"
            className="text-xs font-bold uppercase tracking-wider text-[#0a0a0a] hover:underline"
          >
            Browse all shops →
          </Link>
        </div>

        {shops.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.slice(0, 6).map((shop) => (
              <RestaurantCard key={shop._id || shop.id} restaurant={shop} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-[#e7e5df] bg-white p-10 text-center">
            <Store className="mx-auto size-8 text-[#0a0a0a]" />
            <h3 className="mt-3 text-lg font-bold text-[#0a0a0a]">Verified Independent Stores</h3>
            <p className="mt-1 text-sm text-[#737069]">
              Explore boutique shops delivering to your doorstep.
            </p>
            <Link
              to="/shops"
              className="mt-4 inline-block font-semibold text-xs uppercase tracking-wider text-[#0a0a0a] underline"
            >
              Open store directory
            </Link>
          </div>
        )}
      </section>

      {/* ── 5. Seller Onboarding Callout (Etsy-inspired Seller Banner) ── */}
      <section className="container-app">
        <div className="rounded-3xl border border-[#e7e5df] bg-[#ffffff] p-8 sm:p-14 shadow-sm">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e7e5df] bg-[#faf9f5] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0a0a0a]">
              <Store className="size-3.5" /> For Independent Makers & Shops
            </span>
            <h2 className="mt-4 text-3xl font-serif italic font-black text-[#0a0a0a] sm:text-4xl">
              Turn your passion into a thriving storefront.
            </h2>
            <p className="mt-3 text-base text-[#575550]">
              Millions of shoppers are waiting. Open your store on Vendra today with streamlined catalog management and zero onboarding friction.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/vendor/register')}
                className="rounded-full px-8 h-12 text-xs font-bold uppercase tracking-wider"
              >
                Open your store
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/vendor/login')}
                className="rounded-full px-8 h-12 text-xs font-bold uppercase tracking-wider"
              >
                Sign in to Vendor Panel
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
