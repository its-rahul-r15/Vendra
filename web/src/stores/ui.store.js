import { create } from 'zustand'

let toastId = 0

export const useUiStore = create((set) => ({
  toasts: [],
  vegOnly: false,

  setVegOnly(vegOnly) {
    set({ vegOnly })
  },

  toast(message, type = 'info') {
    const id = ++toastId
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 3200)
  },

  dismissToast(id) {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
}))
