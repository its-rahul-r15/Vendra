import { Link } from 'react-router-dom'
import { Star, MapPin, ArrowRight } from 'lucide-react'
import { restaurantCover } from '@/utils/media'

export function RestaurantCard({ restaurant }) {
  const id = restaurant._id || restaurant.id
  const name = restaurant.name || 'Merchant Store'
  const image = restaurantCover(restaurant)
  const avgRating = Number(restaurant.rating?.average || 0)
  const ratingCount = Number(restaurant.rating?.count || 0)
  const cuisines = Array.isArray(restaurant.cuisines)
    ? restaurant.cuisines.join(' • ')
    : restaurant.cuisines || restaurant.vertical || 'Independent Merchant'
  const address = restaurant.address?.city || restaurant.address?.line1 || 'Verified Seller'
  const isOpen = restaurant.isOpen !== false

  return (
    <Link
      to={`/shops/${id}`}
      className="group block rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5"
    >
      {/* High Quality Banner Aspect View */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f3f0]">
        <img
          src={image}
          alt={name}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Rating badge if available */}
        {avgRating > 0 && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-xs px-2.5 py-1 text-[11px] font-black text-white shadow-xs">
            <Star className="size-3 fill-[#f59e0b] text-[#f59e0b]" />
            <span>{avgRating.toFixed(1)}</span>
            {ratingCount > 0 && <span className="text-[10px] text-white/70">({ratingCount})</span>}
          </div>
        )}

        {!isOpen && (
          <span className="absolute right-3 top-3 rounded-full bg-[#120b0d]/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            Closed
          </span>
        )}
      </div>

      {/* Card Info Section */}
      <div className="p-5 flex flex-col space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-black text-[#120b0d] group-hover:text-[#990024] transition-colors line-clamp-1">
            {name}
          </h3>
        </div>

        <p className="line-clamp-1 text-xs text-[#736c6e] font-medium">
          {cuisines}
        </p>

        <div className="pt-3 flex items-center justify-between text-xs font-semibold text-[#8c8587]">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-[#8c8587]" />
            <span>{address}</span>
          </span>
          <span className="text-[#120b0d] group-hover:text-[#990024] font-bold text-xs flex items-center gap-1 transition">
            <span>View Store</span>
            <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}
