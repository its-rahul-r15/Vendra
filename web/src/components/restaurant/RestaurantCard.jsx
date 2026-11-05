import { Link } from 'react-router-dom'
import { Star, Clock3, Bike } from 'lucide-react'
import { restaurantCover } from '@/utils/media'
import { Badge } from '@/components/ui/Badge'

export function RestaurantCard({ restaurant }) {
  const id = restaurant._id || restaurant.id
  const cover = restaurantCover(restaurant)
  const rating = restaurant.rating?.average || restaurant.rating || restaurant.avgRating
  const eta = restaurant.deliveryTime || restaurant.eta || restaurant.approxDeliveryTime
  const fee = restaurant.deliveryFee ?? restaurant.deliveryCharge

  return (
    <Link
      to={`/restaurants/${id}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_10px_30px_rgba(20,20,20,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(20,20,20,0.08)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink/5">
        <img
          src={cover}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {restaurant.isVeg || restaurant.pureVeg ? (
          <div className="absolute left-3 top-3">
            <Badge tone="veg">Pure veg</Badge>
          </div>
        ) : null}
        {restaurant.isOpen === false ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <Badge tone="dark">Closed</Badge>
          </div>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="line-clamp-1 text-lg font-bold text-white drop-shadow">
            {restaurant.name}
          </h3>
          {rating ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-veg px-1.5 py-0.5 text-xs font-bold text-white">
              <Star className="size-3 fill-current" />
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 p-3.5">
        <p className="line-clamp-1 text-sm text-muted">
          {(restaurant.cuisines || restaurant.cuisine || []).join?.(', ') ||
            restaurant.cuisineType ||
            restaurant.category ||
            'Restaurant'}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-soft">
          {eta ? (
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5 text-muted" />
              {typeof eta === 'number' ? `${eta} mins` : eta}
            </span>
          ) : null}
          {fee != null ? (
            <span className="inline-flex items-center gap-1">
              <Bike className="size-3.5 text-muted" />
              {Number(fee) === 0 ? 'Free delivery' : `₹${fee}`}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
