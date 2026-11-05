import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Flame } from 'lucide-react'
import { feedApi, restaurantsApi } from '@/api'
import { useLocationStore } from '@/stores/location.store'
import { useUiStore } from '@/stores/ui.store'
import { RestaurantCard } from '@/components/restaurant/RestaurantCard'
import { resolveImage } from '@/utils/media'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function HomePage() {
  const location = useLocationStore((s) => s.location)
  const requestBrowserLocation = useLocationStore((s) => s.requestBrowserLocation)
  const vegOnly = useUiStore((s) => s.vegOnly)

  const [loading, setLoading] = useState(true)
  const [feed, setFeed] = useState(null)
  const [nearby, setNearby] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    requestBrowserLocation()
  }, [requestBrowserLocation])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [home, near] = await Promise.all([
          feedApi.home({
            lat: location.lat,
            lng: location.lng,
            isVeg: vegOnly || undefined,
          }),
          restaurantsApi.nearby({
            lat: location.lat,
            lng: location.lng,
            isVeg: vegOnly || undefined,
            limit: 12,
          }),
        ])
        if (cancelled) return
        setFeed(home)
        setNearby(near.restaurants)
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
  }, [location.lat, location.lng, vegOnly])

  const banners = useMemo(() => {
    const list = feed?.heroBanners || feed?.banners || []
    return Array.isArray(list) ? list.slice(0, 6) : []
  }, [feed])

  const categories = useMemo(() => {
    const list = feed?.categories || []
    return Array.isArray(list) ? list.slice(0, 10) : []
  }, [feed])

  const restaurants = useMemo(() => {
    if (nearby.length) return nearby
    return feed?.restaurants || []
  }, [nearby, feed])

  const spotlight = feed?.mustTry || feed?.recommended || feed?.trending || []

  if (loading) {
    return (
      <div className="container-app flex justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Couldn't load home"
        description={error}
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="animate-rise">
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 brand-gradient opacity-[0.97]" />
        <img
          src="/brand/burger.png"
          alt=""
          className="pointer-events-none absolute -right-8 bottom-0 hidden w-[280px] drop-shadow-2xl md:block lg:right-10 lg:w-[340px]"
        />
        <img
          src="/brand/chili.png"
          alt=""
          className="pointer-events-none absolute left-[8%] top-8 hidden w-16 opacity-90 md:block"
        />

        <div className="container-app relative grid gap-8 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-14">
          <div className="text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              Food, ftafat
            </p>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-[0.95] tracking-wide md:text-7xl">
              Hungry?
              <br />
              We move faster.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
              Nearby kitchens, real menus, live order tracking. Built for weeknight
              cravings and rainy-day thalis.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/search"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-brand"
              >
                Find food <ArrowRight className="size-4" />
              </Link>
              <button
                type="button"
                onClick={() => requestBrowserLocation()}
                className="inline-flex h-12 items-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Use my location
              </button>
            </div>
          </div>

          <div className="relative min-h-[180px] md:min-h-[260px]">
            {banners[0] ? (
              <a
                href={banners[0].link || banners[0].ctaUrl || '#'}
                className="block overflow-hidden rounded-3xl border border-white/20 shadow-2xl"
              >
                <img
                  src={resolveImage(banners[0].image || banners[0].imageUrl)}
                  alt={banners[0].title || 'Offer'}
                  className="aspect-[16/9] w-full object-cover"
                />
              </a>
            ) : (
              <div className="flex h-full items-end justify-end">
                <img src="/brand/pizza.png" alt="" className="w-[220px] drop-shadow-xl" />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-app space-y-10 py-8 md:py-10">
        {categories.length > 0 ? (
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-3xl tracking-wide text-ink">What&apos;s cooking</h2>
            </div>
            <div className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {categories.map((cat) => (
                <Link
                  key={cat._id || cat.id || cat.name}
                  to={`/search?q=${encodeURIComponent(cat.name || '')}`}
                  className="flex w-[88px] shrink-0 flex-col items-center gap-2"
                >
                  <div className="grid size-[72px] place-items-center overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
                    {cat.image || cat.icon ? (
                      <img
                        src={resolveImage(cat.image || cat.icon)}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Flame className="size-6 text-brand" />
                    )}
                  </div>
                  <span className="line-clamp-2 text-center text-xs font-semibold text-ink-soft">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {banners.length > 1 ? (
          <section className="hide-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
            {banners.slice(1).map((banner, idx) => (
              <a
                key={banner._id || banner.id || idx}
                href={banner.link || banner.ctaUrl || '#'}
                className="w-[min(320px,80vw)] shrink-0 overflow-hidden rounded-2xl border border-line"
              >
                <img
                  src={resolveImage(banner.image || banner.imageUrl)}
                  alt={banner.title || 'Promo'}
                  className="aspect-[16/7] w-full object-cover"
                />
              </a>
            ))}
          </section>
        ) : null}

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl tracking-wide text-ink">Near you</h2>
              <p className="mt-1 text-sm text-muted">Restaurants delivering to your area</p>
            </div>
            <Link to="/search" className="text-sm font-bold text-brand hover:underline">
              See all
            </Link>
          </div>

          {restaurants.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant._id || restaurant.id}
                  restaurant={restaurant}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No restaurants nearby"
              description="Try another location or clear the veg filter."
            />
          )}
        </section>

        {Array.isArray(spotlight) && spotlight.length > 0 ? (
          <section className="rounded-3xl border border-line noise-panel p-5 md:p-6">
            <h2 className="font-display text-3xl tracking-wide text-ink">Worth a try</h2>
            <div className="mt-4 hide-scrollbar flex gap-3 overflow-x-auto pb-1">
              {spotlight.slice(0, 12).map((item) => (
                <div
                  key={item._id || item.id || item.name}
                  className="w-[160px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <img
                    src={resolveImage(item.image || item.images?.[0])}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-sm font-bold text-ink">{item.name}</p>
                    {item.price != null ? (
                      <p className="mt-1 text-xs font-semibold text-muted">₹{item.price}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
