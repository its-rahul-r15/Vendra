import { api, unwrap } from './client'

export const catalogApi = {
  async categories(params = {}) {
    try {
      const { data } = unwrap(await api.get('/catalog/categories', { params }))
      return data?.categories || []
    } catch {
      const { data } = unwrap(await api.get('/categories', { params }))
      return data?.categories || []
    }
  },

  async categoriesTree(params = {}) {
    try {
      const { data } = unwrap(await api.get('/catalog/categories/tree', { params }))
      return data?.categories || []
    } catch {
      const { data } = unwrap(await api.get('/categories/tree', { params }))
      return data?.categories || []
    }
  },

  async products(params = {}) {
    const { data, meta } = unwrap(
      await api.get('/catalog/search', {
        params: { limit: 50, ...params },
      }),
    )
    return { products: data?.listings || [], meta }
  },

  async product(listingId) {
    const { data } = unwrap(await api.get(`/catalog/products/${listingId}`))
    return data?.listing
  },

  // Vendor listing management
  async createListing(payload) {
    const { data } = unwrap(await api.post('/catalog/listings', payload))
    return data?.listing || data
  },

  async updateListing(id, payload) {
    const { data } = unwrap(await api.patch(`/catalog/listings/${id}`, payload))
    return data?.listing || data
  },

  async createVendorItem(payload) {
    const { data } = unwrap(await api.post('/catalog/items/vendor', payload))
    return data
  },

  async listCommerceProducts(params = {}) {
    const { data } = unwrap(await api.get('/catalog/admin/products', { params }))
    return data?.listings || []
  },

  async getPublicHeroConfigs() {
    const { data } = unwrap(await api.get('/catalog/hero-configs'))
    return data?.configs || []
  },
}
