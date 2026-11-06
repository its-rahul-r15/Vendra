import { create } from 'zustand'

const STORAGE_KEY = 'vendra_cart_v2'

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], subtotal: 0, vendorId: null, vendorName: null }
    const parsed = JSON.parse(raw)
    const items = Array.isArray(parsed.items) ? parsed.items : []
    const subtotal = items.reduce((sum, item) => sum + (Number(item.pricePaise) || 0) * (item.quantity || 1), 0)
    return {
      items,
      subtotal,
      vendorId: parsed.vendorId || null,
      vendorName: parsed.vendorName || null,
    }
  } catch {
    return { items: [], subtotal: 0, vendorId: null, vendorName: null }
  }
}

function persistCart(data, set) {
  const items = data.items || []
  const subtotal = items.reduce((sum, item) => sum + (Number(item.pricePaise) || 0) * (item.quantity || 1), 0)
  const cartData = {
    items,
    subtotal,
    vendorId: items.length ? data.vendorId : null,
    vendorName: items.length ? data.vendorName : null,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData))
  set({
    cart: cartData,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    loading: false,
  })
}

const initialCart = readCart()

export const useCartStore = create((set, get) => ({
  cart: initialCart,
  itemCount: initialCart.items.reduce((sum, item) => sum + item.quantity, 0),
  loading: false,

  async refresh() {
    return get().cart
  },

  /**
   * Adds an item to the cart.
   * Can accept either a catalog listing or a restaurant menu item.
   */
  async addItem(productOrItem, quantity = 1, options = {}) {
    const isListing = Boolean(productOrItem.pricePaise !== undefined || productOrItem.itemId)
    const id = String(productOrItem._id || productOrItem.id || productOrItem.listingId || productOrItem.menuItemId)
    
    let itemPayload = null
    const currentCart = get().cart
    const items = [...currentCart.items]

    if (isListing) {
      const itemData = productOrItem.itemId || productOrItem.product || {}
      const pricePaise = Number(productOrItem.pricePaise || 0)
      const mrpPaise = Number(productOrItem.mrpPaise || pricePaise)
      const vendor = productOrItem.vendorId || {}
      const vendorId = vendor._id || vendor.id || currentCart.vendorId
      const vendorName = vendor.name || currentCart.vendorName || 'Vendra Marketplace'

      const existingIndex = items.findIndex((it) => it.id === id || it.listingId === id)
      if (existingIndex > -1) {
        items[existingIndex].quantity = Math.min(items[existingIndex].quantity + quantity, 20)
      } else {
        itemPayload = {
          id,
          listingId: id,
          type: 'listing',
          name: itemData.name || productOrItem.name || 'Product',
          pricePaise,
          mrpPaise,
          quantity,
          unit: itemData.attributes?.unit || 'unit',
          image: itemData.media?.find((m) => m.isPrimary)?.url || itemData.media?.[0]?.url || productOrItem.image || '',
          vendorId,
          vendorName,
        }
        items.push(itemPayload)
      }
      persistCart({ items, vendorId, vendorName }, set)
    } else {
      // Restaurant / Food Menu Item
      // Prices from menuItem model are in standard units (INR) or paise depending on field
      const rawPrice = productOrItem.price || 0
      // If rawPrice > 1000, likely paise, otherwise rupees -> convert to paise
      const pricePaise = rawPrice > 5000 ? rawPrice : Math.round(rawPrice * 100)
      const restaurantId = options.restaurantId || productOrItem.restaurant || currentCart.vendorId
      const restaurantName = options.restaurantName || currentCart.vendorName || 'Partner Store'

      const existingIndex = items.findIndex((it) => it.id === id || it.menuItemId === id)
      if (existingIndex > -1) {
        items[existingIndex].quantity = Math.min(items[existingIndex].quantity + quantity, 20)
      } else {
        itemPayload = {
          id,
          menuItemId: id,
          type: 'menu_item',
          name: productOrItem.name || 'Item',
          pricePaise,
          mrpPaise: pricePaise,
          quantity,
          unit: 'portion',
          image: productOrItem.image || productOrItem.imageUrl || '',
          isVeg: productOrItem.isVeg ?? true,
          vendorId: restaurantId,
          vendorName: restaurantName,
        }
        items.push(itemPayload)
      }
      persistCart({ items, vendorId: restaurantId, vendorName: restaurantName }, set)
    }

    return get().cart
  },

  async setQuantity(id, quantity) {
    const current = get().cart
    const targetId = String(id)
    const items = current.items
      .map((item) => {
        if (item.id === targetId || item.listingId === targetId || item.menuItemId === targetId) {
          return { ...item, quantity: Math.min(quantity, 20) }
        }
        return item
      })
      .filter((item) => item.quantity > 0)

    persistCart({ items, vendorId: current.vendorId, vendorName: current.vendorName }, set)
    return get().cart
  },

  async removeItem(id) {
    return get().setQuantity(id, 0)
  },

  async clear() {
    localStorage.removeItem(STORAGE_KEY)
    set({
      cart: { items: [], subtotal: 0, vendorId: null, vendorName: null },
      itemCount: 0,
      loading: false,
    })
  },
}))
