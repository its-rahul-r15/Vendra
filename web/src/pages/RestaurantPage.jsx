import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Clock3 } from 'lucide-react'
import { restaurantsApi } from '@/api'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { restaurantCover } from '@/utils/media'
import { MenuItemRow } from '@/components/restaurant/MenuItemRow'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'

export function RestaurantPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const toast = useUiStore((s) => s.toast)
  const cart = useCartStore((s) => s.cart)
  const addItem = useCartStore((s) => s.addItem)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const cartLoading = useCartStore((s) => s.loading)

  const [loading, setLoading] = useState(true)
  const [restaurant, setRestaurant] = useState(null)
  const [menu, setMenu] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [rest, menuData] = await Promise.all([
          restaurantsApi.get(id),
          restaurantsApi.menu(id),
        ])
        if (cancelled) return
        setRestaurant(rest)
        setMenu(Array.isArray(menuData) ? menuData : [])
        setActiveCategory(menuData?.[0]?._id || menuData?.[0]?.name || null)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const qtyMap = useMemo(() => {
    const map = {}
    for (const item of cart?.items || []) {
      const key =
        item.menuItem?._id ||
        item.menuItem ||
        item.menuItemId ||
        item._id
      if (key) map[String(key)] = item.quantity || 0
    }
    return map
  }, [cart])

  async function ensureAuth() {
    if (user) return true
    toast('Login to add items', 'info')
    navigate('/login', { state: { from: `/restaurants/${id}` } })
    return false
  }

  async function handleAdd(menuItemId) {
    if (!(await ensureAuth())) return
    try {
      await addItem(menuItemId, 1)
      toast('Added to cart', 'success')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  async function handleChange(menuItemId, quantity) {
    if (!(await ensureAuth())) return
    try {
      await setQuantity(menuItemId, quantity)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <EmptyState
        title="Restaurant unavailable"
        description={error || 'We could not find this kitchen.'}
        actionLabel="Back home"
        onAction={() => navigate('/')}
      />
    )
  }

  const rating =
    restaurant.rating?.average || restaurant.rating || restaurant.avgRating

  return (
    <div className="animate-rise">
      <div className="relative h-56 overflow-hidden md:h-72">
        <img
          src={restaurantCover(restaurant)}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
        <div className="container-app absolute inset-x-0 bottom-0 pb-6 text-white">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" /> Back
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-4xl tracking-wide md:text-5xl">
                {restaurant.name}
              </h1>
              <p className="mt-1 text-sm text-white/75">
                {(restaurant.cuisines || []).join(', ') ||
                  restaurant.cuisineType ||
                  'Restaurant'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {rating ? (
                <Badge tone="veg" className="normal-case tracking-normal">
                  <Star className="size-3 fill-current" /> {Number(rating).toFixed(1)}
                </Badge>
              ) : null}
              {restaurant.deliveryTime ? (
                <Badge tone="dark" className="normal-case tracking-normal">
                  <Clock3 className="size-3" /> {restaurant.deliveryTime} mins
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {menu.length > 1 ? (
        <div className="sticky top-16 z-30 border-b border-line bg-surface/95 backdrop-blur md:top-[72px]">
          <div className="container-app hide-scrollbar flex gap-2 overflow-x-auto py-3">
            {menu.map((cat) => {
              const key = cat._id || cat.name
              const active = activeCategory === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActiveCategory(key)
                    document
                      .getElementById(`cat-${key}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-brand text-white'
                      : 'bg-paper text-ink-soft hover:bg-brand/10'
                  }`}
                >
                  {cat.name || cat.category}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="container-app max-w-3xl py-6">
        {menu.length === 0 ? (
          <EmptyState title="Menu coming soon" description="This kitchen has not published items yet." />
        ) : (
          menu.map((cat) => {
            const key = cat._id || cat.name
            const items = cat.items || cat.menuItems || []
            return (
              <section key={key} id={`cat-${key}`} className="scroll-mt-36">
                <h2 className="mb-1 font-display text-2xl tracking-wide text-ink">
                  {cat.name || cat.category}
                </h2>
                <div>
                  {items.map((item) => {
                    const itemId = String(item._id || item.id)
                    return (
                      <MenuItemRow
                        key={itemId}
                        item={item}
                        quantity={qtyMap[itemId] || 0}
                        onAdd={handleAdd}
                        onChange={handleChange}
                        busy={cartLoading}
                      />
                    )
                  })}
                </div>
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
