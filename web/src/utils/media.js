const DEFAULT_UNSPLASH = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'

const KEYWORD_UNSPLASH_MAP = [
  // Headphones & Audio
  { keywords: ['headphone', 'audio', 'earbud', 'earphone', 'headset'], url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  // Speakers
  { keywords: ['speaker', 'bluetooth', 'soundbar', 'acoustic'], url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80' },
  // Phones & Mobile
  { keywords: ['phone', 'smartphone', 'mobile', 'iphone', 'android', 'cell'], url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80' },
  // Phone Cases
  { keywords: ['case', 'cover', 'protective'], url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80' },
  // Chargers & Cables
  { keywords: ['charger', 'cable', 'usb', 'gan', 'fast charge', 'adapter', 'hub'], url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80' },
  // Watches
  { keywords: ['watch', 'smartwatch', 'timepiece', 'chronograph', 'analog', 'wristwatch'], url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80' },
  // Perfume & Fragrance
  { keywords: ['perfume', 'parfum', 'fragrance', 'amber', 'scent'], url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80' },
  // Serums & Skincare
  { keywords: ['serum', 'skincare', 'botanical', 'face', 'glow', 'mask', 'cream', 'lotion'], url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80' },
  // Cosmetics
  { keywords: ['cosmetic', 'cosmetics', 'beauty', 'makeup'], url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80' },
  // Shoes & Footwear
  { keywords: ['shoe', 'shoes', 'sneaker', 'sneakers', 'runner', 'footwear', 'boot', 'boots', 'sandals'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80' },
  // Clothes & Apparel
  { keywords: ['t-shirt', 'tee', 'supima', 'cotton', 'oversized'], url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80' },
  { keywords: ['shirt', 'linen', 'button-down'], url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80' },
  { keywords: ['overcoat', 'coat', 'jacket', 'wool'], url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80' },
  { keywords: ['cloth', 'clothes', 'apparel', 'garment', 'fashion', 'wear', 'dress'], url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80' },
  // Accessories & Leather
  { keywords: ['wallet', 'cardholder', 'leather'], url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80' },
  { keywords: ['sunglass', 'sunglasses', 'eyewear', 'glasses'], url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80' },
  { keywords: ['bag', 'backpack', 'tote', 'handbag'], url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
  { keywords: ['accessory', 'accessories'], url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80' },
  // Computers & Laptops
  { keywords: ['laptop', 'computer', 'macbook', 'pc'], url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80' },
  { keywords: ['keyboard', 'mouse', 'stand'], url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80' },
  // Cameras
  { keywords: ['camera', 'webcam', 'tripod', 'photo', 'photography'], url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  // Smart Home
  { keywords: ['smart home', 'smart-home', 'plug', 'bulb', 'light', 'lamp'], url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80' },
  // Electronics general
  { keywords: ['electronics', 'gadget', 'device', 'tech'], url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&q=80' },
  // Food & Grocery
  { keywords: ['pizza'], url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80' },
  { keywords: ['burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { keywords: ['biryani'], url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80' },
  { keywords: ['thali', 'curry', 'rice'], url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80' },
  { keywords: ['dessert', 'sweet', 'cake'], url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80' },
  { keywords: ['grocery', 'food', 'snack', 'beverage', 'mart'], url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80' },
]

export function getUnsplashFallback(hint = '') {
  if (hint) {
    const text = String(hint).toLowerCase()
    for (const entry of KEYWORD_UNSPLASH_MAP) {
      if (entry.keywords.some((kw) => text.includes(kw))) {
        return entry.url
      }
    }
  }
  return DEFAULT_UNSPLASH
}

export function resolveImage(src, hint = '', fallback) {
  let resolved = null
  if (typeof src === 'string' && src.trim() && !src.startsWith('data:image/svg')) {
    resolved = src.trim()
  } else if (src && typeof src === 'object') {
    resolved = src.url || src.secure_url || src.path || null
  }

  if (resolved && !resolved.startsWith('data:image/svg')) {
    return resolved
  }

  if (fallback && typeof fallback === 'string' && !fallback.startsWith('data:image/svg')) {
    return fallback
  }

  return getUnsplashFallback(hint)
}

export function restaurantCover(restaurant) {
  return resolveImage(
    restaurant?.coverImage ||
      restaurant?.image ||
      restaurant?.bannerImage ||
      restaurant?.logo ||
      restaurant?.photos?.[0],
    restaurant?.name || restaurant?.vertical || 'restaurant'
  )
}

export function itemImage(item) {
  return resolveImage(
    item?.image || item?.images?.[0] || item?.photo || item?.thumbnail || item?.media?.[0]?.url,
    item?.name || item?.category?.name || 'product'
  )
}
