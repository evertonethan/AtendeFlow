import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  title: string
  message?: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { id, duration: 4000, ...toast }
    toasts.value.push(newToast)

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function success(title: string, message?: string) {
    addToast({ title, message, type: 'success' })
  }

  function error(title: string, message?: string) {
    addToast({ title, message, type: 'error' })
  }

  function info(title: string, message?: string) {
    addToast({ title, message, type: 'info' })
  }

  function warning(title: string, message?: string) {
    addToast({ title, message, type: 'warning' })
  }

  return { toasts, addToast, removeToast, success, error, info, warning }
})
