import { api, unwrap } from './client'

export const usersApi = {
  async me() {
    const { data } = unwrap(await api.get('/users/me'))
    return data?.user || data
  },

  async updateMe(payload) {
    const { data } = unwrap(await api.patch('/users/me', payload))
    return data?.user || data
  },

  async addresses() {
    const { data } = unwrap(await api.get('/users/me/addresses'))
    return data?.addresses || []
  },

  async addAddress(payload) {
    const { data } = unwrap(await api.post('/users/me/addresses', payload))
    return data?.address
  },

  async updateAddress(id, payload) {
    const { data } = unwrap(await api.patch(`/users/me/addresses/${id}`, payload))
    return data?.address
  },

  async deleteAddress(id) {
    await api.delete(`/users/me/addresses/${id}`)
  },
}
