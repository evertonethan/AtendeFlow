const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3000/api')
const TOKEN_KEY = 'atendeflow.token'

export function getToken() { return localStorage.getItem(TOKEN_KEY) }
export function setToken(token: string) { localStorage.setItem(TOKEN_KEY, token) }
export function clearToken() { localStorage.removeItem(TOKEN_KEY) }

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se o servidor está em execução.')
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { error?: string }
    if (response.status === 401) clearToken()
    throw new Error(payload.error ?? `Falha na requisição (${response.status}).`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}