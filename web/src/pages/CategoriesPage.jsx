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
    <div className="container-app py-10 animate-rise">
      {/* Header Banner */}
      <div className="border-b border-[#e7e5df] pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#737069]">
              <Layers className="size-4" />
              Department Directory
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0a0a0a] sm:text-4xl">
              Category-Wise Shopping List
            </h1>
            <p className="mt-2 text-base text-[#575550]">
              Browse products by department or category with quick shopping controls.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-[#e7e5df] bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  viewMode === 'grid'
                    ? 'bg-[#0a0a0a] text-white'
                    : 'text-[#575550] hover:text-[#0a0a0a]'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  viewMode === 'list'
                    ? 'bg-[#0a0a0a] text-white'
                    : 'text-[#575550] hover:text-[#0a0a0a]'
                }`}
              >
                Shopping List
              </button>
            </div>

            {/* Sort Selector */}
            <select
              aria-label="Sort catalog"
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-10 rounded-xl border border-[#e7e5df] bg-white px-3 text-sm font-medium text-[#121212] outline-none focus:border-[#0a0a0a]"
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
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              !activeCategoryId
                ? 'bg-[#0a0a0a] text-white'
                : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
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
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#0a0a0a] text-white'
                    : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
                }`}
              >
                {cat.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area: Sidebar Tree + Products */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Left: Department Tree Navigation */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#e7e5df] bg-white p-5">
            <h3 className="text-base font-bold text-[#0a0a0a]">Categories</h3>
            <div className="mt-4 space-y-1">
              <button
                type="button"
                onClick={() => selectCategory('')}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  !activeCategoryId
                    ? 'bg-[#faf9f5] font-bold text-[#0a0a0a]'
                    : 'text-[#575550] hover:bg-[#faf9f5]'
                }`}
              >
                <span>All Products</span>
                {!activeCategoryId ? <Check className="size-4" /> : null}
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
                          ? 'bg-[#faf9f5] font-bold text-[#0a0a0a]'
                          : 'text-[#575550] hover:bg-[#faf9f5]'
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
                                  ? 'font-bold text-[#0a0a0a]'
                                  : 'text-[#737069] hover:text-[#0a0a0a]'
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

          <div className="rounded-2xl border border-[#e7e5df] bg-[#faf9f5] p-5">
            <h4 className="text-sm font-bold text-[#0a0a0a]">Are you a vendor?</h4>
            <p className="mt-1.5 text-xs text-[#737069] leading-relaxed">
              List your catalog items under these categories and start selling to thousands of customers.
            </p>
            <Link
              to="/vendor/register"
              className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#0a0a0a] underline"
            >
              <span>Register as a vendor</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </aside>

        {/* Right: Product Display (Grid or Quick Shopping List) */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0a0a0a]">
              {selectedCategory?.name || 'All Categories'}
              <span className="ml-2 text-sm font-normal text-[#737069]">
                ({products.length} {products.length === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>

          {loadingProducts ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner className="size-8 text-[#0a0a0a]" />
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
            <div className="divide-y divide-[#e7e5df] rounded-2xl border border-[#e7e5df] bg-white">
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
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition hover:bg-[#faf9f5]"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Link
                        to={`/products/${listingId}`}
                        className="size-18 shrink-0 overflow-hidden rounded-xl bg-[#f4f2ec] border border-[#e7e5df]"
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
                          <span className="font-semibold text-[#121212]">
                            {vendor.name || 'Vendra'}
                          </span>
                          <span>·</span>
                          <span className="truncate">{category.name || 'Marketplace'}</span>
                        </div>

                        <Link
                          to={`/products/${listingId}`}
                          className="mt-0.5 block truncate text-base font-bold text-[#121212] hover:underline"
                        >
                          {itemData.name || 'Product'}
                        </Link>

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-base font-bold text-[#121212]">
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
                        <div className="flex h-10 items-center gap-2 rounded-xl border border-[#121212] bg-white px-2">
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

