import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { catalogApi } from '@/api'
import { ProductCard } from '@/components/commerce/ProductCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') || '')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const categoryId = params.get('categoryId') || ''
  const sort = params.get('sort') || 'newest'

  useEffect(() => { catalogApi.categories().then(setCategories).catch(() => {}) }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      setError('')
      const next = new URLSearchParams(params)
      if (query.trim()) next.set('q', query.trim())
      else next.delete('q')
      setParams(next, { replace: true })
      catalogApi.products({ q: query.trim() || undefined, categoryId: categoryId || undefined, sort, limit: 100 })
        .then(({ products: result }) => { if (active) setProducts(result) })
        .catch((err) => { if (active) setError(err.message) })
        .finally(() => { if (active) setLoading(false) })
    }, 180)
    return () => { active = false; clearTimeout(timer) }
  }, [query, categoryId, sort, setParams])

  function updateParam(key, value) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return (
    <div className="container-app py-7 animate-rise md:py-9">
      <div className="mb-7 rounded-3xl bg-[#f4f6fb] p-5 md:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Discover something great</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink md:text-4xl">Explore the marketplace</h1>
        <div className="relative mt-5 max-w-2xl"><Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search electronics, watches, accessories…" className="h-14 w-full rounded-xl border border-line bg-white pl-12 pr-4 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10" /></div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2"><span className="mr-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted"><SlidersHorizontal className="size-3.5" /> Categories</span><button type="button" onClick={() => updateParam('categoryId', '')} className={`rounded-full border px-3.5 py-2 text-xs font-bold ${!categoryId ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink-soft'}`}>All products</button>{categories.map((category) => <button key={category._id} type="button" onClick={() => updateParam('categoryId', categoryId === category._id ? '' : category._id)} className={`rounded-full border px-3.5 py-2 text-xs font-bold ${categoryId === category._id ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-ink-soft'}`}>{category.name}</button>)}<select aria-label="Sort products" value={sort} onChange={(event) => updateParam('sort', event.target.value)} className="ml-auto h-10 rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink"><option value="newest">Recommended</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></div>

      <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-extrabold text-ink">{query ? `Results for “${query}”` : categoryId ? categories.find((category) => category._id === categoryId)?.name || 'Products' : 'All products'}</h2><p className="mt-1 text-sm text-muted">{products.length} products</p></div></div>
      {loading ? <div className="flex justify-center py-16"><Spinner className="size-7" /></div> : null}
      {!loading && error ? <EmptyState title="Couldn't load products" description={error} actionLabel="Try again" onAction={() => window.location.reload()} /> : null}
      {!loading && !error && !products.length ? <EmptyState title="No products found" description="Try another search or category." actionLabel="Clear filters" onAction={() => { setQuery(''); setParams({}) }} /> : null}
      {!loading && products.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div> : null}
    </div>
  )
}
