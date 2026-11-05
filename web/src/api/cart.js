import { api, unwrap } from './client'

export const cartApi = {
  async get() {
    const { data } = unwrap(await api.get('/cart'))
    return data?.cart || { items: [], subtotal: 0 }
  },

  async addItem(menuItemId, quantity = 1) {
    const { data } = unwrap(await api.post('/cart/items', { menuItemId, quantity }))
    return data?.cart
  },

  async updateItem(menuItemId, quantity) {
    const { data } = unwrap(
      await api.patch(`/cart/items/${menuItemId}`, { quantity }),
    )
    return data?.cart
  },

  async removeItem(menuItemId) {
    const { data } = unwrap(await api.delete(`/cart/items/${menuItemId}`))
    return data?.cart
  },

  async clear() {
    await api.delete('/cart')
  },
}
