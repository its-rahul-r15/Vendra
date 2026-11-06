import { create } from 'zustand'

const STORAGE_KEY = 'marketplace_cart_v1'

function readCart() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

function publish(items, set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  set({
    cart: {
      items,
      subtotal: items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0),
    },
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    loading: false,
  })
}

const initialItems = readCart()

export const useCartStore = create((set, get) => ({
  cart: { items: initialItems, subtotal: initialItems.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0) },
  itemCount: initialItems.reduce((sum, item) => sum + item.quantity, 0),
  loading: false,

  async refresh() {
    return get().cart
  },

  async addItem(listing, quantity = 1) {
    const listingId = String(listing._id || listing.id)
    const product = listing.itemId || listing.product || {}
    const items = [...get().cart.items]
    const existing = items.find((item) => item.listingId === listingId)
    if (existing) existing.quantity = Math.min(existing.quantity + quantity, listing.maxQtyPerOrder || 20)
    else items.push({
      listingId,
      itemId: String(product._id || product.id || ''),
      name: product.name || listing.name || 'Product',
      pricePaise: Number(listing.pricePaise || 0),
      mrpPaise: Number(listing.mrpPaise || 0),
      quantity,
      unit: product.attributes?.unit || 'piece',
      image: product.media?.find((media) => media.isPrimary)?.url || product.media?.[0]?.url || '',
      maxQtyPerOrder: listing.maxQtyPerOrder || 20,
    })
    publish(items, set)
    return get().cart
  },

  async setQuantity(listingId, quantity) {
    const items = get().cart.items
      .map((item) => item.listingId === String(listingId)
        ? { ...item, quantity: Math.min(quantity, item.maxQtyPerOrder || 20) }
        : item)
      .filter((item) => item.quantity > 0)
    publish(items, set)
    return get().cart
  },

  async clear() {
    localStorage.removeItem(STORAGE_KEY)
    set({ cart: { items: [], subtotal: 0 }, itemCount: 0, loading: false })
  },
}))
