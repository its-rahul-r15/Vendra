import { Link } from 'react-router-dom'
import { Star, Clock3, MapPin } from 'lucide-react'
import { restaurantCover } from '@/utils/media'

export function RestaurantCard({ restaurant }) {
  const id = restaurant._id || restaurant.id
  const name = restaurant.name || 'Merchant Store'
  const image = restaurantCover(restaurant)
  const rating = restaurant.rating?.average || restaurant.avgRating || 4.8
  const cuisines = Array.isArray(restaurant.cuisines)
    ? restaurant.cuisines.join(' • ')
    : restaurant.cuisines || restaurant.vertical || 'Independent Store'
  const address = restaurant.address?.city || restaurant.address?.line1 || 'Verified Seller'
  const isOpen = restaurant.isOpen !== false

  return (
    <Link
      to={`/shops/${id}`}
      className="group flat-card flex flex-col overflow-hidden bg-white text-left transition duration-200 hover:border-[#000000]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f4f5]">
        <img
          src={image}
          alt={name}
          className="size-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Rating Pill */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded bg-black/85 px-2 py-0.5 text-xs font-black text-white">
          <Star className="size-3 fill-[#eab308] text-[#eab308]" />
          <span>{Number(rating).toFixed(1)}</span>
        </div>

        {!isOpen ? (
          <span className="absolute right-2.5 top-2.5 rounded bg-[#e11d48] px-2 py-0.5 text-[11px] font-black uppercase text-white">
            Closed
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm sm:text-base font-extrabold text-[#09090b] group-hover:underline line-clamp-1">
          {name}
        </h3>

        <p className="mt-1 line-clamp-1 text-xs font-medium text-[#71717a]">{cuisines}</p>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[#f4f4f5] text-[11px] font-bold text-[#52525b]">
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-[#a1a1aa]" /> {address}
          </span>
          <span className="text-[#09090b]">View Store →</span>
        </div>
      </div>
    </Link>
  )
}
