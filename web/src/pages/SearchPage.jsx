import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchApi } from '@/api'
import { useLocationStore } from '@/stores/location.store'
import { useUiStore } from '@/stores/ui.store'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { resolveImage } from '@/utils/media'
import { formatINR } from '@/utils/money'
import { Link } from 'react-router-dom'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('q') || ''
  const [query, setQuery] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [items, setItems] = useState([])
  const location = useLocationStore((s) => s.location)
  const vegOnly = useUiStore((s) => s.vegOnly)

  useEffect(() => {
    const q = query.trim()
    setParams(q ? { q } : {})

    if (q.length < 2) {
      setRestaurants([])
      setItems([])
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [rest, dish] = await Promise.all([
          searchApi.restaurants({
            q,
            lat: location.lat,
            lng: location.lng,
            isVeg: vegOnly || undefined,
          }),
          searchApi.items({ q, isVeg: vegOnly || undefined }),
        ])
        if (cancelled) return
        setRestaurants(rest.restaurants)
        setItems(dish.items)
      } catch {
        if (!cancelled) {
          setRestaurants([])
          setItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 280)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, location.lat, location.lng, vegOnly, setParams])

  return (
    <div className="container-app py-8 animate-rise">
      <div className="relative mx-auto max-w-2xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search biryani, pizza, cafes…"
          className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-base outline-none ring-brand/10 transition focus:border-brand focus:ring-4"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="size-7" />
        </div>
      ) : null}

      {!loading && query.trim().length >= 2 && !restaurants.length && !items.length ? (
        <EmptyState
          title="No matches"
          description="Try another dish name or restaurant."
        />
      ) : null}

      {items.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl tracking-wide">Dishes</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item._id || item.id}
                to={
                  item.restaurantId || item.restaurant?._id
                    ? `/restaurants/${item.restaurantId || item.restaurant._id}`
                    : '/search'
                }
                className="flex gap-3 rounded-2xl border border-line bg-surface p-3 transition hover:border-brand/30"
              >
                <img
                  src={resolveImage(item.image || item.images?.[0])}
                  alt=""
                  className="size-16 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.restaurantName || item.restaurant?.name || 'Restaurant'}
                  </p>
                  {item.price != null ? (
                    <p className="mt-1 text-sm font-semibold">{formatINR(item.price)}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {restaurants.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-3xl tracking-wide">Restaurants</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id || restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
