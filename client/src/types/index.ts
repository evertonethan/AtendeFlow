export type Status = 'Aberta' | 'Em andamento' | 'Concluída'
export type Priority = 'Baixa' | 'Média' | 'Alta'
export interface RequestItem {
  id: string
  title: string
  description: string
  category: string
  status: Status
  priority: Priority
  createdAt: string
  updatedAt?: string
}
export interface User { id: string; name: string; email: string }
export interface AuthResponse { token: string; user: User }