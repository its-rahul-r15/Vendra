import { create } from 'zustand'
import { cartApi } from '@/api'

function countItems(cart) {
  return (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
}

export const useCartStore = create((set, get) => ({
  cart: { items: [], subtotal: 0 },
  loading: false,
  error: null,
  itemCount: 0,

  async refresh() {
    set({ loading: true, error: null })
    try {
      const cart = await cartApi.get()
      set({ cart, itemCount: countItems(cart), loading: false })
      return cart
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async addItem(menuItemId, quantity = 1) {
    set({ loading: true, error: null })
    try {
      const cart = await cartApi.addItem(menuItemId, quantity)
      set({ cart, itemCount: countItems(cart), loading: false })
      return cart
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async setQuantity(menuItemId, quantity) {
    set({ loading: true, error: null })
    try {
      const cart =
        quantity <= 0
          ? await cartApi.removeItem(menuItemId)
          : await cartApi.updateItem(menuItemId, quantity)
      set({ cart, itemCount: countItems(cart), loading: false })
      return cart
    } catch (error) {
      set({ loading: false, error: error.message })
      throw error
    }
  },

  async clear() {
    await cartApi.clear()
    set({ cart: { items: [], subtotal: 0 }, itemCount: 0 })
  },

  getRestaurantId() {
    const cart = get().cart
    const first = cart?.items?.[0]
    return (
      cart?.restaurantId ||
      cart?.restaurant?._id ||
      first?.restaurantId ||
      first?.menuItem?.restaurant ||
      null
    )
  },
}))
