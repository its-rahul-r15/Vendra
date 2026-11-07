import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Truck,
  Store,
  Search,
  Star,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Minus,
  Plus,
  Leaf,
  Moon,
  Info,
  ChevronDown,
} from 'lucide-react'
import { catalogApi, restaurantsApi } from '@/api'
import { ProductCard } from '@/components/commerce/ProductCard'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { Spinner } from '@/components/ui/Spinner'

// 3 Handcrafted Luxury Hero Products with Distinct Center Radial Glows (Headphones, Shoes, Camera)
const HERO_PRODUCTS = [
  {
    id: 'luxe-headphones',
    name: 'Aura Studio Max',
    tagline: 'Spatial Audio · Active Noise Cancellation',
    specs: '40hr Battery · Titanium Arc',
    editionCount: '30mm',
    options: ['30mm', '40mm', '50mm'],
    pricePaise: 499900, // ₹4,999
    mrpPaise: 899900,
    // Velvet Carmine Radial Glow (Exact user loved color)
    radialGlow: 'radial-gradient(ellipse at center, #ba2249 0%, #990f30 50%, #6e0820 100%)',
    themeName: 'Velvet Carmine',
    image: '/hero/headphones-wireless.png',
  },
  {
    id: 'luxe-shoes',
    name: 'Air Velocity Elite',
    tagline: 'Carbon-Fiber Plate · Nitrogen Foam Cushioning',
    specs: 'Ultra-Light 185g · Knit Fit',
    editionCount: 'UK 8',
    options: ['UK 8', 'UK 9', 'UK 10'],
    pricePaise: 1199900, // ₹11,999
    mrpPaise: 1899900,
    // Deep Imperial Emerald Glow (Center highlighted rich green)
    radialGlow: 'radial-gradient(ellipse at center, #1b4938 0%, #113627 50%, #0a2118 100%)',
    themeName: 'Imperial Emerald',
    image: '/hero/luxe-sneaker.png',
  },
  {
    id: 'luxe-camera',
    name: 'Leica Vision M',
    tagline: 'Handcrafted Precision · 35mm Full-Frame Sensor',
    specs: 'Summicron Glass · 4K Cinema Raw',
    editionCount: '35mm',
    options: ['35mm', '50mm', '85mm'],
    pricePaise: 2499900, // ₹24,999
    mrpPaise: 3499900,
    // Deep Midnight Sapphire Glow (Center highlighted luxury navy)
    radialGlow: 'radial-gradient(ellipse at center, #273e63 0%, #182740 50%, #0d1524 100%)',
    themeName: 'Midnight Sapphire',
    image: '/hero/camera-leica.png',
  },
]

const ECOM_VALUE_PROPS = [
  {
    icon: Truck,
    title: 'Free Express Shipping',
    desc: 'Across India on orders over ₹499',
    color: 'text-[#990024]',
  },
  {
    icon: ShieldCheck,
    title: '100% Genuine Guarantee',
    desc: 'Verified brand sellers with warranty',
    color: 'text-emerald-600',
  },
  {
    icon: RotateCcw,
    title: '7-Day Easy Returns',
    desc: 'Instant doorstep pickup & refund',
    color: 'text-amber-500',
  },
  {
    icon: Sparkles,
    title: 'Curated Artisan Goods',
    desc: 'Bespoke independent collections',
    color: 'text-rose-600',
  },
]

export function HomePage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  // Active slide index & interactive option
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedOption, setSelectedOption] = useState(HERO_PRODUCTS[0].options[0])
  const [heroQuantity, setHeroQuantity] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const toast = useUiStore((s) => s.toast)

  // Auto transition right-to-left every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleSlideChange((activeIdx + 1) % HERO_PRODUCTS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [activeIdx])

  function handleSlideChange(nextIndex) {
    if (nextIndex === activeIdx || isTransitioning) return
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveIdx(nextIndex)
      setSelectedOption(HERO_PRODUCTS[nextIndex].options[0])
      setHeroQuantity(1)
      setIsTransitioning(false)
    }, 300)
  }

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      try {
        const [categoryList, productRes, nearbyRes] = await Promise.allSettled([
          catalogApi.categories(),
          catalogApi.products({ limit: 16, sort: 'newest' }),
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

  const current = HERO_PRODUCTS[activeIdx]

  async function handleHeroBuy() {
    const matched = products[activeIdx] || products[0]
    if (matched) {
      try {
        const id = String(matched._id || matched.id)
        await addItem(id, heroQuantity)
        toast(`Added ${current.name} to bag!`, 'success')
        navigate('/cart')
      } catch (err) {
        toast(err.message || 'Could not add to cart', 'error')
      }
    } else {
      navigate('/categories')
    }
  }

  function scrollToContent() {
    const el = document.getElementById('marketplace-content')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#8f0e2b] flex items-center justify-center">
        {/* Silent smooth backdrop while initial categories & products hydrate */}
      </div>
    )
  }

  return (
    <div className="animate-rise">
      {/* ── 1. CENTER RADIAL GLOW LUXURY HERO STAGE (HEADPHONES, SHOES, CAMERA) ── */}
      <section
        style={{
          background: current.radialGlow,
        }}
        className="relative min-h-screen w-full text-white flex flex-col justify-between pt-24 pb-8 sm:pb-12 px-6 sm:px-12 lg:px-16 transition-all duration-700 overflow-hidden select-none"
      >
        {/* Top Sub-Navigation (‹ Back | Relax / Sleep / Active | Slide Counter) */}
        <div className="relative z-10 flex items-center justify-between text-xs font-semibold text-white/80 max-w-7xl mx-auto w-full pt-2">
          <Link to="/categories" className="hover:text-white transition flex items-center gap-1.5 text-xs">
            <span>‹ Explore Catalog</span>
          </Link>

          {/* Center Mood Pills */}
          <div className="flex items-center gap-2 text-xs">
            {HERO_PRODUCTS.map((prod, idx) => (
              <button
                key={prod.id}
                onClick={() => handleSlideChange(idx)}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition-all cursor-pointer ${
                  activeIdx === idx
                    ? 'bg-white text-[#120b0d] font-bold shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{prod.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] uppercase tracking-widest text-white/70 font-bold">
            0{activeIdx + 1} / 0{HERO_PRODUCTS.length}
          </span>
        </div>

        {/* Center Stage: Left Product Title | Centered BIG Hero Product | Right Pills */}
        <div className="relative z-10 my-auto py-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 max-w-7xl mx-auto w-full">
          
          {/* Left: Product Name & Specs (Reference Inspired Typography) */}
          <div
            className={`lg:col-span-4 space-y-4 text-left transition-all duration-300 ${
              isTransitioning ? 'opacity-0 -translate-x-6' : 'opacity-100 translate-x-0'
            }`}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white">
              {current.name}
            </h1>
            <p className="text-sm font-bold text-white/80 tracking-wide">
              {current.tagline}
            </p>
            <p className="text-xs text-white/70 font-medium">
              {current.specs}
            </p>
          </div>

          {/* Center: BIG LUXURY TRANSPARENT PRODUCT with Smooth Right-to-Left Slide */}
          <div className="lg:col-span-4 flex justify-center items-center py-2">
            <div className="relative size-72 sm:size-88 lg:size-[400px] flex items-center justify-center">
              <img
                key={current.id}
                src={current.image}
                alt={current.name}
                className={`max-h-full max-w-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] transition-all duration-500 ease-out transform ${
                  isTransitioning
                    ? 'opacity-0 translate-x-16 scale-95'
                    : 'opacity-100 translate-x-0 scale-100 hover:scale-105'
                }`}
              />
            </div>
          </div>

          {/* Right: Interactive Dimension / Size Pills (Matching Reference 30 / 60 / 90) */}
          <div
            className={`lg:col-span-4 flex flex-col lg:items-end justify-center space-y-4 transition-all duration-300 ${
              isTransitioning ? 'opacity-0 translate-x-6' : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`size-11 sm:size-12 rounded-full text-xs font-black transition-all cursor-pointer ${
                    selectedOption === opt
                      ? 'bg-white text-[#120b0d] shadow-lg scale-110'
                      : 'text-white/70 hover:text-white bg-white/10'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium">
              <Info className="size-3.5 text-white/60" />
              <span>Certified 100% Genuine · Full Warranty</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Trust Quote (Left), Huge Price (Center/Right), Stepper & Pill Buy Now */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 max-w-7xl mx-auto w-full">
          {/* Trust Statement */}
          <div className="max-w-xs text-[11px] leading-relaxed text-white/70 font-medium">
            We work in close partnership with verified independent creators and certified global suppliers.
          </div>

          {/* Price & Action Pill Controls */}
          <div className="flex items-center gap-6 sm:gap-8">
            <div className="flex flex-col text-right sm:text-left">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {formatINRFromPaise(current.pricePaise * heroQuantity)}
              </span>
              <span className="text-xs text-white/50 line-through font-semibold">
                {formatINRFromPaise(current.mrpPaise * heroQuantity)}
              </span>
            </div>

            {/* Stepper [ - 1 + ] & Pill 'Buy Now' */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 bg-black/25 px-4 py-2.5 rounded-full text-white font-bold backdrop-blur-md">
                <button
                  onClick={() => setHeroQuantity(Math.max(1, heroQuantity - 1))}
                  className="hover:text-white/70 transition cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="text-sm font-black min-w-4 text-center">{heroQuantity}</span>
                <button
                  onClick={() => setHeroQuantity(heroQuantity + 1)}
                  className="hover:text-white/70 transition cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <button
                onClick={handleHeroBuy}
                className="flex items-center gap-2 rounded-full bg-white text-[#0f172a] hover:bg-slate-100 px-8 py-3 text-sm font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ShoppingBag className="size-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="mx-auto mt-2 flex items-center gap-1.5 text-[11px] font-bold text-white/60 hover:text-white transition cursor-pointer animate-bounce"
        >
          <span>Scroll to explore full catalog</span>
          <ChevronDown className="size-4" />
        </button>

      </section>

      {/* ── 2. LIGHT PART — TRANSITIONS SMOOTHLY ON SCROLL (AUTHENTIC E-COMMERCE HUB) ── */}
      <div id="marketplace-content" className="bg-[#fcfbfa] text-[#120b0d] pt-12 pb-20 space-y-16">
        
        {/* Value Proposition Bar — Architectural, Clean, Borderless */}
        <section className="container-app">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-6 border-b border-black/[0.06]">
            {ECOM_VALUE_PROPS.map((prop) => {
              const Icon = prop.icon
              return (
                <div
                  key={prop.title}
                  className="flex items-start gap-4 group"
                >
                  <div className="size-10 rounded-xl bg-black/[0.03] group-hover:bg-[#990024]/10 transition-colors flex items-center justify-center shrink-0">
                    <Icon className="size-5 text-[#120b0d] group-hover:text-[#990024] transition-colors stroke-[2]" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-black text-[#120b0d] tracking-tight">{prop.title}</h4>
                    <p className="text-xs text-[#6e686a] font-medium leading-relaxed">{prop.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Shop by Department — Ultra-Sleek Modern Luxury Category Rail */}
        <section className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/[0.06]">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#990024]">
                Curated Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#120b0d] tracking-tight mt-1">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#120b0d] hover:text-[#990024] transition-colors group"
            >
              <span>View All Categories ({categories.length})</span>
              <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Clean, Non-Boxy Modern Category Presentation (High-End Circle Avatar + Label) */}
          <div className="mt-8 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6">
            {categories.slice(0, 8).map((cat, idx) => (
              <Link
                key={cat._id || cat.slug || cat.name}
                to={`/categories?categoryId=${cat._id || cat.slug}`}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                {/* Minimal Circular Thumbnail with Thin Ring Effect */}
                <div className="relative size-18 sm:size-20 md:size-22 rounded-full p-1 bg-[#f4f3f0] ring-1 ring-black/5 group-hover:ring-[#990024] group-hover:scale-105 transition-all duration-300">
                  <div className="size-full rounded-full overflow-hidden bg-white">
                    <img
                      src={resolveImage(cat.image || cat.iconUrl)}
                      alt={cat.name}
                      className="size-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Refined Label & Count */}
                <div className="mt-2.5 space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-[#120b0d] group-hover:text-[#990024] transition-colors leading-tight line-clamp-1">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider text-[#736c6e] font-semibold block">
                    0{idx + 1}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Marketplace Products */}
        <section className="container-app">
          <div className="flex items-center justify-between pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#990024]" />
                <h2 className="text-xl sm:text-2xl font-black text-[#120b0d] tracking-tight">
                  Featured Products & Best Deals
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#5c5658]">
                Authentic items from verified sellers with fast dispatch
              </p>
            </div>
            <Link
              to="/search"
              className="text-xs font-bold text-[#990024] hover:underline"
            >
              View all products ({products.length}) →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl bg-white p-12 text-center shadow-xs">
              <Search className="mx-auto size-8 text-[#9c9597]" />
              <p className="mt-3 text-xs font-bold text-[#5c5658]">Loading latest catalog...</p>
            </div>
          )}
        </section>

        {/* Independent Verified Stores */}
        <section className="container-app pb-20">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#120b0d] tracking-tight">
                Verified Brand Stores
              </h2>
              <p className="text-xs sm:text-sm text-[#5c5658]">
                Shop directly from top-rated merchants across the nation
              </p>
            </div>
            <Link
              to="/shops"
              className="text-xs font-bold text-[#990024] hover:underline"
            >
              All Stores →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shops.slice(0, 6).map((shop) => (
              <Link
                key={shop._id || shop.id}
                to={`/shops/${shop._id || shop.id}`}
                className="clean-card group flex flex-col overflow-hidden bg-white text-left"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#f5f4f0]">
                  <img
                    src={resolveImage(shop.coverImage || shop.image)}
                    alt={shop.name}
                    className="size-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#120b0d] shadow-xs">
                    <Star className="size-3 fill-[#f59e0b] text-[#f59e0b]" />
                    <span>{Number(shop.rating?.average || 4.8).toFixed(1)}</span>
                  </div>
                </div>

                <div className="p-5 flex flex-1 flex-col">
                  <h3 className="text-base font-bold text-[#120b0d] group-hover:text-[#990024] transition-colors line-clamp-1">
                    {shop.name}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-xs text-[#5c5658] font-medium">
                    {Array.isArray(shop.cuisines) ? shop.cuisines.join(' • ') : shop.vertical || 'Independent Merchant'}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs font-semibold text-[#5c5658]">
                    <span>{shop.address?.city || 'Verified Seller'}</span>
                    <span className="text-[#990024] font-bold">Visit Store →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
