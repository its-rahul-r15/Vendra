import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Layers,
  ArrowRight,
  SlidersHorizontal,
  ChevronRight,
  ShoppingBag,
  Minus,
  Plus,
  Check,
} from 'lucide-react'
import { catalogApi } from '@/api'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/commerce/ProductCard'

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategoryId = searchParams.get('categoryId') || ''
  const sort = searchParams.get('sort') || 'newest'

  const [categoriesTree, setCategoriesTree] = useState([])
  const [flatCategories, setFlatCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  const addItem = useCartStore((s) => s.addItem)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const cartItems = useCartStore((s) => s.cart.items)
  const toast = useUiStore((s) => s.toast)

  // Fetch Categories
  useEffect(() => {
    let active = true
    async function fetchCategories() {
      setLoadingCats(true)
      try {
        const [flat, tree] = await Promise.allSettled([
          catalogApi.categories(),
          catalogApi.categoriesTree(),
        ])
        if (!active) return

        const flats = flat.status === 'fulfilled' ? flat.value || [] : []
        const trees = tree.status === 'fulfilled' ? tree.value || [] : []
        setFlatCategories(flats)
        setCategoriesTree(trees.length ? trees : flats)
      } finally {
        if (active) setLoadingCats(false)
      }
    }
    fetchCategories()
    return () => {
      active = false
    }
  }, [])

  // Fetch Products for the selected category or all
  useEffect(() => {
    let active = true
    async function fetchProducts() {
      setLoadingProducts(true)
      try {
        const params = {
          limit: 60,
          sort,
          ...(activeCategoryId ? { categoryId: activeCategoryId } : {}),
        }
        const res = await catalogApi.products(params)
        if (!active) return
        setProducts(res.products || [])
      } catch (err) {
        if (active) toast(err.message, 'error')
      } finally {
        if (active) setLoadingProducts(false)
      }
    }
    fetchProducts()
    return () => {
      active = false
    }
  }, [activeCategoryId, sort, toast])

  function selectCategory(catId) {
    const next = new URLSearchParams(searchParams)
    if (catId) {
      next.set('categoryId', catId)
    } else {
      next.delete('categoryId')
    }
    setSearchParams(next)
  }

  function handleSortChange(newSort) {
    const next = new URLSearchParams(searchParams)
    next.set('sort', newSort)
    setSearchParams(next)
  }

  const selectedCategory = flatCategories.find(
    (c) => String(c._id || c.id) === String(activeCategoryId),
  )

  return (
    <div className="container-app py-8 sm:py-12 animate-rise">
      {/* Header Banner — Minimalist Editorial Style */}
      <div className="pb-8 border-b border-black/[0.06]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#990024]">
              Marketplace Catalog
            </span>
            <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-[#120b0d]">
              Curated Departments
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#5c5658] font-medium">
              Explore authentic products from certified independent creators and brand sellers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#120b0d] text-white shadow-xs'
                    : 'text-[#5c5658] hover:text-[#120b0d]'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#120b0d] text-white shadow-xs'
                    : 'text-[#5c5658] hover:text-[#120b0d]'
                }`}
              >
                List View
              </button>
            </div>

            {/* Sort Selector */}
            <select
              aria-label="Sort catalog"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-9 rounded-full bg-slate-100 px-4 text-xs font-bold text-[#120b0d] outline-none border-none cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Horizontal Filter Pills */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => selectCategory('')}
            className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              !activeCategoryId
                ? 'bg-[#120b0d] text-white shadow-xs'
                : 'bg-white border border-black/10 text-[#5c5658] hover:text-[#120b0d] hover:border-black/30'
            }`}
          >
            All Departments
          </button>

          {flatCategories.map((cat) => {
            const catId = cat._id || cat.id
            const isActive = String(catId) === String(activeCategoryId)
            return (
              <button
                key={catId}
                type="button"
                onClick={() => selectCategory(catId)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#990024] text-white shadow-xs'
                    : 'bg-white border border-black/10 text-[#5c5658] hover:text-[#120b0d] hover:border-black/30'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area: Sidebar Tree + Products */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Left: Department Tree Navigation */}
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white p-5 ring-1 ring-black/[0.05]">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#120b0d] pb-3 border-b border-black/[0.05]">
              Departments
            </h3>
            <div className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => selectCategory('')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold transition cursor-pointer ${
                  !activeCategoryId
                    ? 'bg-[#fdf2f4] text-[#990024]'
                    : 'text-[#5c5658] hover:bg-slate-50'
                }`}
              >
                <span>All Products</span>
                {!activeCategoryId ? <Check className="size-3.5" /> : null}
              </button>

              {categoriesTree.map((parent) => {
                const parentId = parent._id || parent.id
                const isParentActive = String(parentId) === String(activeCategoryId)
                const hasSubs = Array.isArray(parent.subcategories) && parent.subcategories.length > 0

                return (
                  <div key={parentId} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => selectCategory(parentId)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                        isParentActive
                          ? 'bg-slate-50 font-bold text-[#dc2626]'
                          : 'text-[#575550] hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{parent.name}</span>
                      {isParentActive ? <Check className="size-4" /> : null}
                    </button>

                    {hasSubs ? (
                      <div className="ml-4 space-y-0.5 border-l border-[#e7e5df] pl-2">
                        {parent.subcategories.map((sub) => {
                          const subId = sub._id || sub.id
                          const isSubActive = String(subId) === String(activeCategoryId)
                          return (
                            <button
                              key={subId}
                              type="button"
                              onClick={() => selectCategory(subId)}
                              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-medium transition ${
                                isSubActive
                                  ? 'font-bold text-[#dc2626]'
                                  : 'text-[#737069] hover:text-[#dc2626]'
                              }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              {isSubActive ? <Check className="size-3" /> : null}
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <h4 className="text-sm font-bold text-[#dc2626]">Are you a vendor?</h4>
            <p className="mt-1.5 text-xs text-[#737069] leading-relaxed">
              List your catalog items under these categories and start selling to thousands of customers.
            </p>
            <Link
              to="/vendor/register"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#dc2626] underline"
            >
              <span>Register as a vendor</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </aside>

        {/* Right: Product Display (Grid or Quick Shopping List) */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#dc2626]">
              {selectedCategory?.name || 'All Categories'}
              <span className="ml-2 text-sm font-normal text-[#737069]">
                ({products.length} {products.length === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>

          {loadingProducts ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner className="size-8 text-[#dc2626]" />
            </div>
          ) : !products.length ? (
            <EmptyState
              title="No products found in this category"
              description="Explore other departments or check back soon as vendors add inventory."
              actionLabel="View all products"
              onAction={() => selectCategory('')}
            />
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            </div>
          ) : (
            /* Shopping List View (Fast Add List) */
            <div className="divide-y divide-[#e7e5df] rounded-2xl border border-slate-100 bg-white">
              {products.map((product) => {
                const listingId = String(product._id || product.id)
                const itemData = product.itemId || product.product || {}
                const category = itemData.categoryId || itemData.category || {}
                const vendor = product.vendorId || {}
                const image =
                  itemData.media?.find((m) => m.isPrimary)?.url ||
                  itemData.media?.[0]?.url ||
                  product.image
                const cartEntry = cartItems.find(
                  (c) => c.id === listingId || c.listingId === listingId,
                )
                const available =
                  product.isAvailable !== false &&
                  (!product.stock?.track || product.stock.available > 0)

                return (
                  <div
                    key={listingId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        to={`/products/${listingId}`}
                        className="size-18 shrink-0 overflow-hidden rounded-xl bg-[#f4f2ec] border border-slate-100"
                      >
                        <img
                          src={resolveImage(image)}
                          alt={itemData.name}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs text-[#737069]">
                          <span className="font-semibold text-[#111827]">
                            {vendor.name || 'Vendra'}
                          </span>
                          <span>·</span>
                          <span className="truncate">{category.name || 'Marketplace'}</span>
                        </div>

                        <Link
                          to={`/products/${listingId}`}
                          className="mt-0.5 block truncate text-base font-bold text-[#111827] hover:underline"
                        >
                          {itemData.name || 'Product'}
                        </Link>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-bold text-[#111827]">
                            {formatINRFromPaise(product.pricePaise || 0)}
                          </span>
                          {product.mrpPaise > product.pricePaise ? (
                            <span className="text-xs text-[#99958d] line-through">
                              {formatINRFromPaise(product.mrpPaise)}
                            </span>
                          ) : null}
                          <span className="text-xs text-[#737069]">
                            / {itemData.attributes?.unit || 'unit'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      {cartEntry ? (
                        <div className="flex h-10 items-center gap-2 rounded-xl border border-[#111827] bg-white px-2">
                          <button
                            type="button"
                            aria-label="Decrease"
                            onClick={() => setQuantity(listingId, cartEntry.quantity - 1)}
                            className="grid size-7 place-items-center rounded-lg hover:bg-black/5"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="min-w-6 text-center font-bold text-sm">
                            {cartEntry.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase"
                            onClick={() => setQuantity(listingId, cartEntry.quantity + 1)}
                            className="grid size-7 place-items-center rounded-lg hover:bg-black/5"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={!available}
                          onClick={() => {
                            addItem(product)
                            toast('Added to cart', 'success')
                          }}
                          className="h-10 px-4 text-xs font-semibold"
                        >
                          <ShoppingBag className="size-3.5" />
                          <span>{available ? 'Add to List' : 'Sold out'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

