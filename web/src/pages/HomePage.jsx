import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Headphones, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import { catalogApi } from '@/api'
import { ProductCard } from '@/components/commerce/ProductCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { resolveImage } from '@/utils/media'

export function HomePage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([catalogApi.categories(), catalogApi.products({ limit: 100, sort: 'newest' })])
      .then(([categoryList, result]) => {
        if (!active) return
        setCategories(categoryList)
        setProducts(result.products)
      })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) return <div className="container-app flex justify-center py-24"><Spinner className="size-8" /></div>
  if (error) return <EmptyState title="The store is unavailable" description={error} actionLabel="Try again" onAction={() => window.location.reload()} />

  return (
    <div className="animate-rise">
      <section className="overflow-hidden bg-[#f4f6fb]">
        <div className="container-app grid min-h-[390px] items-center gap-8 py-10 md:grid-cols-[1fr_0.9fr] md:py-14">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-brand shadow-sm"><Sparkles className="size-3.5" /> THE EVERYDAY MARKETPLACE</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.03] tracking-tight text-ink md:text-6xl">The things you love.<br /><span className="text-brand">All in one place.</span></h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">Discover electronics, watches, accessories and more from trusted sellers.</p>
            <Link to="/search" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark">Explore products <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative mx-auto grid w-full max-w-lg grid-cols-2 gap-3">
            <div className="col-span-2 flex aspect-[2.2/1] items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-200 via-blue-100 to-sky-100 text-7xl shadow-inner" aria-hidden="true">📱</div>
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 text-6xl shadow-inner" aria-hidden="true">⌚</div>
            <div className="flex aspect-square items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 text-6xl shadow-inner" aria-hidden="true">🎧</div>
          </div>
        </div>
      </section>

      <div className="container-app space-y-10 py-8 md:py-10">
        <section className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-surface p-4 md:grid-cols-4 md:p-5">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft md:text-sm"><Truck className="size-4 text-brand" /> Reliable delivery</div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft md:text-sm"><BadgeCheck className="size-4 text-brand" /> Trusted products</div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft md:text-sm"><ShieldCheck className="size-4 text-brand" /> Secure checkout</div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-ink-soft md:text-sm"><Headphones className="size-4 text-brand" /> Helpful support</div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">Browse the store</p><h2 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">Shop by category</h2></div><Link to="/search" className="text-sm font-bold text-brand">All products <ArrowRight className="inline size-4" /></Link></div>
          {categories.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.slice(0, 12).map((category) => <Link key={category._id} to={`/search?categoryId=${category._id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:shadow-md"><div className="grid aspect-[1.3] place-items-center overflow-hidden bg-paper">{category.image || category.iconUrl ? <img src={resolveImage(category.image || category.iconUrl)} alt="" className="size-full object-cover transition group-hover:scale-105" /> : <span className="text-4xl">{category.name?.toLowerCase().includes('watch') ? '⌚' : category.name?.toLowerCase().includes('access') ? '🎧' : '📱'}</span>}</div><p className="truncate p-3 text-sm font-bold text-ink">{category.name}</p></Link>)}</div> : <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">The store is being set up. Products will appear here soon.</p>}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">Handpicked for you</p><h2 className="mt-1 text-2xl font-extrabold text-ink md:text-3xl">Featured products</h2></div><Link to="/search" className="text-sm font-bold text-brand">See all <ArrowRight className="inline size-4" /></Link></div>
          {products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{products.slice(0, 10).map((product) => <ProductCard key={product._id} product={product} />)}</div> : <div className="rounded-2xl bg-paper px-6 py-10 text-center"><Search className="mx-auto size-7 text-muted" /><p className="mt-3 text-sm text-muted">New arrivals are on the way.</p></div>}
        </section>
      </div>
    </div>
  )
}
