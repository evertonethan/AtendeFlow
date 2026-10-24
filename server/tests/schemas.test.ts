import { describe, expect, it } from 'vitest'
import { createRequestSchema, registerSchema, updateRequestSchema } from '../src/schemas.js'

describe('schemas da API', () => {
  it('normaliza e valida e-mail no cadastro', () => {
    const result = registerSchema.safeParse({ name: 'Everton', email: 'TESTE@EXEMPLO.COM', password: 'senha-segura-123' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('teste@exemplo.com')
  })
  it('rejeita senha curta', () => {
    expect(registerSchema.safeParse({ name: 'Eva', email: 'eva@exemplo.com', password: '123' }).success).toBe(false)
  })
  it('rejeita atualização sem campos', () => {
    expect(updateRequestSchema.safeParse({}).success).toBe(false)
  })
  it('valida dados mínimos da solicitação', () => {
    expect(createRequestSchema.safeParse({
      title: 'Falha de acesso', description: 'Não consigo acessar o sistema',
      category: 'Acesso e conta', priority: 'Alta',
    }).success).toBe(true)
  })
})