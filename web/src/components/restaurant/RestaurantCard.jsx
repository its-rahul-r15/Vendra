import { Link } from 'react-router-dom'
import { Star, Clock3, MapPin, Store } from 'lucide-react'
import { restaurantCover } from '@/utils/media'

export function RestaurantCard({ restaurant }) {
  const id = restaurant._id || restaurant.id
  const name = restaurant.name || 'Vendor Store'
  const image = restaurantCover(restaurant)
  const rating = restaurant.rating?.average || restaurant.avgRating || 4.8
  const cuisines = Array.isArray(restaurant.cuisines)
    ? restaurant.cuisines.join(', ')
    : restaurant.cuisines || restaurant.vertical || 'Multi-Category Store'
  const time = restaurant.deliveryTimeMinutes
    ? `${restaurant.deliveryTimeMinutes} mins`
    : 'Same-day delivery'
  const address = restaurant.address?.city || restaurant.address?.line1 || 'Locality Store'
  const isOpen = restaurant.isOpen !== false

  return (
    <Link
      to={`/shops/${id}`}
      className="group warm-card flex flex-col overflow-hidden bg-white text-left transition"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f2ec]">
        <img
          src={image}
          alt={name}
          className="size-full object-cover transition duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#121212] shadow-sm backdrop-blur-sm">
          <Star className="size-3.5 fill-[#121212] text-[#121212]" />
          <span>{Number(rating).toFixed(1)}</span>
        </div>
        {!isOpen ? (
          <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            Closed for now
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-[#121212] group-hover:text-[#42403c] line-clamp-1">
            {name}
          </h3>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-[#737069]">{cuisines}</p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#f4f2ec] text-xs font-medium text-[#737069]">
          <span className="flex items-center gap-1">
            <Clock3 className="size-3.5" /> {time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {address}
          </span>
        </div>
      </div>
    </Link>
  )
}
