import { api, unwrap } from './client'

export const catalogApi = {
  async categories() {
    const { data } = unwrap(await api.get('/catalog/categories', { params: { vertical: 'commerce' } }))
    return data?.categories || []
  },
  async products(params = {}) {
    const { data, meta } = unwrap(await api.get('/catalog/search', { params: { vertical: 'commerce', limit: 100, ...params } }))
    return { products: data?.listings || [], meta }
  },
  async product(listingId) {
    const { data } = unwrap(await api.get(`/catalog/products/${listingId}`))
    return data?.listing
  },
}
