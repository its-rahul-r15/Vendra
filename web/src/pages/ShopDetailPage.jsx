import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  Clock3,
  MapPin,
  Store,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import { restaurantsApi, vendorsApi, catalogApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { restaurantCover } from '@/utils/media'
import { MenuItemRow } from '@/components/restaurant/MenuItemRow'
import { ProductCard } from '@/components/commerce/ProductCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export function ShopDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useUiStore((s) => s.toast)

  const cart = useCartStore((s) => s.cart)
  const addItem = useCartStore((s) => s.addItem)
  const setQuantity = useCartStore((s) => s.setQuantity)

  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState(null)
  const [menu, setMenu] = useState([])
  const [catalogListings, setCatalogListings] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function loadShop() {
      setLoading(true)
      setError(null)
      try {
        // Try restaurant/store API first, then vendor API
        let shopData = null
        let menuData = []
        let listings = []

        try {
          shopData = await restaurantsApi.get(id)
          menuData = await restaurantsApi.menu(id)
        } catch {
          shopData = await vendorsApi.get(id)
        }

        // Also fetch catalog items for this vendor if available
        try {
          const catRes = await catalogApi.products({ vendorId: id, limit: 50 })
          listings = catRes?.products || []
        } catch {
          // No listings
        }

        if (cancelled) return
        setStore(shopData)
        setMenu(Array.isArray(menuData) ? menuData : [])
        setCatalogListings(listings)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadShop()
    return () => {
      cancelled = true
    }
  }, [id])

  // Build quantity map for menu items
  const qtyMap = useMemo(() => {
    const map = {}
    for (const item of cart.items || []) {
      const key = item.id || item.menuItemId || item.listingId
      if (key) map[String(key)] = item.quantity || 0
    }
    return map
  }, [cart])

  async function handleAddMenuItem(item) {
    try {
      await addItem(item, 1, {
        restaurantId: store?._id || store?.id || id,
        restaurantName: store?.name || 'Partner Store',
      })
      toast('Added to cart', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleChangeQuantity(menuItemId, quantity) {
    try {
      await setQuantity(menuItemId, quantity)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  if (error || !store) {
    return (
      <EmptyState
        title="Store unavailable"
        description={error || 'We could not find this store.'}
        actionLabel="Back to shop directory"
        onAction={() => navigate('/shops')}
      />
    )
  }

  const name = store.name || 'Partner Store'
  const image = restaurantCover(store)
  const rating = store.rating?.average || store.avgRating || 4.8
  const address = `${store.address?.line1 || ''} ${store.address?.city || ''}`.trim() || 'Locality'
  const time = store.deliveryTimeMinutes ? `${store.deliveryTimeMinutes} mins` : 'Same-day delivery'
  const isOpen = store.isOpen !== false

  // Gather categories from menu
  const menuCategories = menu.map((m) => m.name || m.category || 'Menu Items')

  return (
    <div className="container-app py-8 animate-rise">
      {/* Back button */}
      <Link
        to="/shops"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#737069] hover:text-[#0a0a0a]"
      >
        <ArrowLeft className="size-4" />
        <span>Back to Shops Directory</span>
      </Link>

      {/* Store Header Banner */}
      <div className="overflow-hidden rounded-3xl border border-[#e7e5df] bg-white">
        <div className="relative h-60 w-full overflow-hidden bg-[#f4f2ec] sm:h-72">
          <img src={image} alt={name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md uppercase tracking-wider">
                  {store.vertical || 'Verified Vendor'}
                </span>
                {!isOpen ? (
                  <span className="rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Closed
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Open Now
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                {name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {Number(rating).toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 className="size-4" />
                  {time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store Navigation Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#e7e5df] pb-4">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            activeTab === 'all'
              ? 'bg-[#0a0a0a] text-white'
              : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
          }`}
        >
          All Items
        </button>

        {menuCategories.map((catName) => (
          <button
            key={catName}
            type="button"
            onClick={() => setActiveTab(catName)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === catName
                ? 'bg-[#0a0a0a] text-white'
                : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
            }`}
          >
            {catName}
          </button>
        ))}

        {catalogListings.length > 0 ? (
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === 'listings'
                ? 'bg-[#0a0a0a] text-white'
                : 'border border-[#e7e5df] bg-white text-[#42403c] hover:border-[#0a0a0a]'
            }`}
          >
            Retail Catalog ({catalogListings.length})
          </button>
        ) : null}
      </div>

      {/* Store Catalog Content */}
      <div className="mt-8 space-y-10">
        {/* Render Menu Categories */}
        {menu.length > 0 ? (
          menu
            .filter((category) => {
              if (activeTab === 'all') return true
              return (category.name || category.category) === activeTab
            })
            .map((cat) => {
              const catName = cat.name || cat.category || 'Specialties'
              const items = cat.items || []

              return (
                <section key={cat._id || catName} className="rounded-2xl border border-[#e7e5df] bg-white p-6">
                  <h3 className="text-xl font-bold text-[#0a0a0a]">
                    {catName}{' '}
                    <span className="text-sm font-normal text-[#737069]">
                      ({items.length})
                    </span>
                  </h3>
                  <div className="mt-4 divide-y divide-[#e7e5df]">
                    {items.map((item) => {
                      const itemId = item._id || item.id
                      return (
                        <MenuItemRow
                          key={itemId}
                          item={item}
                          quantity={qtyMap[String(itemId)] || 0}
                          onAdd={() => handleAddMenuItem(item)}
                          onChange={(id, qty) => handleChangeQuantity(id, qty)}
                        />
                      )
                    })}
                  </div>
                </section>
              )
            })
        ) : null}

        {/* Render Retail Listings if vendor has commerce products */}
        {catalogListings.length > 0 && (activeTab === 'all' || activeTab === 'listings') ? (
          <section className="rounded-2xl border border-[#e7e5df] bg-white p-6">
            <h3 className="text-xl font-bold text-[#0a0a0a]">
              Store Catalog Products
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {catalogListings.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            </div>
          </section>
        ) : null}

        {menu.length === 0 && catalogListings.length === 0 ? (
          <EmptyState
            title="Catalog is being updated"
            description="This store has not published their full inventory yet. Check back soon."
            actionLabel="Explore other shops"
            onAction={() => navigate('/shops')}
          />
        ) : null}
      </div>
    </div>
  )
}

