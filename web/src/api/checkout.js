import { api, unwrap } from './client'

export const checkoutApi = {
  async createSession(payload) {
    const { data } = unwrap(await api.post('/checkout/sessions', payload))
    return data
  },
}
