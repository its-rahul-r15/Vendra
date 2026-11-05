import { create } from 'zustand'
import { config } from '@/lib/config'

function loadSaved() {
  try {
    const raw = localStorage.getItem(config.locationKey)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return null
}

function persist(location) {
  localStorage.setItem(config.locationKey, JSON.stringify(location))
}

export const useLocationStore = create((set, get) => ({
  location: loadSaved() || { ...config.defaultLocation },
  permission: 'unknown',
  locating: false,

  setLocation(partial) {
    const next = { ...get().location, ...partial }
    persist(next)
    set({ location: next })
  },

  async requestBrowserLocation() {
    if (!navigator.geolocation) {
      set({ permission: 'unsupported' })
      return get().location
    }

    set({ locating: true })
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Current location',
          }
          persist(next)
          set({ location: next, permission: 'granted', locating: false })
          resolve(next)
        },
        () => {
          set({ permission: 'denied', locating: false })
          resolve(get().location)
        },
        { enableHighAccuracy: false, timeout: 8000 },
      )
    })
  },
}))
