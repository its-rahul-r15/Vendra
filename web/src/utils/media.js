const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <rect fill="#1a1a1a" width="640" height="400"/>
      <text x="50%" y="50%" fill="#666" font-family="sans-serif" font-size="18" text-anchor="middle" dy=".3em">Shop</text>
    </svg>`,
  )

export function resolveImage(src, fallback = PLACEHOLDER) {
  if (!src) return fallback
  if (typeof src === 'string') return src
  return src.url || src.secure_url || src.path || fallback
}

export function restaurantCover(restaurant) {
  return resolveImage(
    restaurant?.coverImage ||
      restaurant?.image ||
      restaurant?.bannerImage ||
      restaurant?.logo ||
      restaurant?.photos?.[0],
  )
}

export function itemImage(item) {
  return resolveImage(item?.image || item?.images?.[0] || item?.photo || item?.thumbnail)
}
