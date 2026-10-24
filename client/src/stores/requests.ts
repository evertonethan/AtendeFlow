import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '../utils/api'
import type { Priority, RequestItem, Status } from '../types'

export const useRequestsStore = defineStore('requests', () => {
  const items = ref<RequestItem[]>([])
  const loading = ref(false)
  const error = ref('')

  const total = computed(() => items.value.length)
  const openCount = computed(() => items.value.filter((item) => item.status === 'Aberta').length)
  const inProgressCount = computed(() => items.value.filter((item) => item.status === 'Em andamento').length)
  const completedCount = computed(() => items.value.filter((item) => item.status === 'Concluída').length)

  async function load(filters: { q?: string; status?: string; priority?: string } = {}) {
    loading.value = true
    error.value = ''
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'Todas' && value !== 'Todos os status' && value !== 'Todas as prioridades') {
          params.set(key, value)
        }
      })
      const result = await api<{ data: RequestItem[] }>(`/requests?${params.toString()}`)
      items.value = result.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erro ao carregar solicitações.'
    } finally {
      loading.value = false
    }
  }

  async function create(input: { title: string; description: string; category: string; priority: Priority }) {
    const result = await api<{ data: RequestItem }>('/requests', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    items.value.unshift(result.data)
    return result.data
  }

  async function update(id: string, patch: { status?: Status; priority?: Priority; title?: string; description?: string; category?: string }) {
    const result = await api<{ data: RequestItem }>(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    const index = items.value.findIndex((item) => item.id === id)
    if (index >= 0) {
      items.value[index] = result.data
    }
    return result.data
  }

  async function remove(id: string) {
    await api<void>(`/requests/${id}`, { method: 'DELETE' })
    items.value = items.value.filter((item) => item.id !== id)
  }

  return {
    items,
    loading,
    error,
    total,
    openCount,
    inProgressCount,
    completedCount,
    load,
    create,
    update,
    remove,
  }
})
