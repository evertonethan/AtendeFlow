import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, clearToken, getToken, setToken } from '../utils/api'
import type { AuthResponse, User } from '../types'

const USER_KEY = 'atendeflow.user'

function getSavedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const user = ref<User | null>(getSavedUser())
  const busy = ref(false)

  async function authenticate(mode: 'login' | 'register', payload: Record<string, string>) {
    busy.value = true
    try {
      const result = await api<AuthResponse>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      token.value = result.token
      user.value = result.user
      setToken(result.token)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      return result
    } finally {
      busy.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    clearToken()
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, busy, authenticate, logout }
})
