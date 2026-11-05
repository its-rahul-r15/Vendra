import { api, unwrap } from './client'

export const couponsApi = {
  async active(restaurantId) {
    const { data } = unwrap(
      await api.get('/coupons/active', {
        params: restaurantId ? { restaurantId } : undefined,
      }),
    )
    return data?.coupons || data?.items || []
  },

  async validate({ code, cartTotal, restaurantId }) {
    const { data } = unwrap(
      await api.post('/coupons/validate', { code, cartTotal, restaurantId }),
    )
    return data
  },
}
