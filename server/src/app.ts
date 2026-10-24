import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { db } from './db.js'
import { createRequestSchema, loginSchema, registerSchema, updateRequestSchema } from './schemas.js'
import { requireAuth, signToken, type AuthRequest } from './auth.js'

const isVercel = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.NOW_REGION ||
  process.env.AWS_LAMBDA_FUNCTION_NAME
)
const isProduction = isVercel || process.env.NODE_ENV === 'production'
const configuredOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
const localOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000']

export const app = express()
app.disable('x-powered-by')
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}))

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas sem header origin (como ferramentas locais, server-side e same-origin)
    if (!origin) return callback(null, true)

    // Origem configurada explicitamente
    if (origin === configuredOrigin) return callback(null, true)

    // Ambiente local no computador
    if (localOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }

    // Ambiente de produção na Vercel: aceita automaticamente domínios vercel.app e a URL do deploy
    if (isProduction || isVercel || origin.endsWith('.vercel.app')) {
      if (origin.endsWith('.vercel.app') || (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL))) {
        return callback(null, true)
      }
    }

    return callback(null, true)
  },
  credentials: true
}))

app.use(express.json({ limit: '100kb' }))

const apiRouter = express.Router()

apiRouter.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }))

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok', service: 'atendeflow-api' }))

apiRouter.post('/auth/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors })
  const { name, email, password } = parsed.data
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' })
  const id = randomUUID()
  const passwordHash = bcrypt.hashSync(password, 12)
  db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email, passwordHash, new Date().toISOString())
  return res.status(201).json({ token: signToken(id), user: { id, name, email } })
})

apiRouter.post('/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Informe e-mail e senha válidos.' })
  const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(parsed.data.email) as
    { id: string; name: string; email: string; password_hash: string } | undefined
  if (!user || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' })
  }
  return res.json({ token: signToken(user.id), user: { id: user.id, name: user.name, email: user.email } })
})

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, name, email, created_at as createdAt FROM users WHERE id = ?').get(req.userId) as
    { id: string; name: string; email: string; createdAt: string } | undefined
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' })
  return res.json({ user })
})

apiRouter.patch('/auth/profile', requireAuth, (req: AuthRequest, res) => {
  const { name, currentPassword, newPassword } = req.body
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Nome deve ter pelo menos 2 caracteres.' })
  }
  const user = db.prepare('SELECT id, name, email, password_hash, created_at as createdAt FROM users WHERE id = ?').get(req.userId) as
    { id: string; name: string; email: string; password_hash: string; createdAt: string } | undefined
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' })

  let passwordHash = user.password_hash
  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'Senha atual incorreta.' })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 8 caracteres.' })
    }
    passwordHash = bcrypt.hashSync(newPassword, 12)
  }

  db.prepare('UPDATE users SET name = ?, password_hash = ? WHERE id = ?').run(name.trim(), passwordHash, req.userId)
  return res.json({ user: { id: user.id, name: name.trim(), email: user.email, createdAt: user.createdAt } })
})

apiRouter.get('/users', requireAuth, (_req, res) => {
  const users = db.prepare('SELECT id, name, email, created_at as createdAt FROM users ORDER BY created_at DESC').all()
  return res.json({ data: users })
})

apiRouter.post('/users', requireAuth, (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors })
  const { name, email, password } = parsed.data
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Já existe um usuário com este e-mail.' })
  const id = randomUUID()
  const passwordHash = bcrypt.hashSync(password, 12)
  db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, name, email, passwordHash, new Date().toISOString())
  return res.status(201).json({ user: { id, name, email } })
})

apiRouter.delete('/users/:id', requireAuth, (req: AuthRequest, res) => {
  if (req.params.id === req.userId) {
    return res.status(400).json({ error: 'Você não pode excluir sua própria conta aqui.' })
  }
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  if (!result.changes) return res.status(404).json({ error: 'Usuário não encontrado.' })
  return res.status(204).send()
})

apiRouter.get('/requests', requireAuth, (req: AuthRequest, res) => {
  const conditions = ['user_id = @userId']
  const params: Record<string, string> = { userId: req.userId! }
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    conditions.push('(title LIKE @q OR description LIKE @q OR category LIKE @q)')
    params.q = `%${req.query.q.trim().slice(0, 100)}%`
  }
  if (typeof req.query.status === 'string' && ['Aberta', 'Em andamento', 'Concluída'].includes(req.query.status)) {
    conditions.push('status = @status'); params.status = req.query.status
  }
  if (typeof req.query.priority === 'string' && ['Baixa', 'Média', 'Alta'].includes(req.query.priority)) {
    conditions.push('priority = @priority'); params.priority = req.query.priority
  }
  const rows = db.prepare(`SELECT id, title, description, category, status, priority, created_at as createdAt, updated_at as updatedAt
    FROM requests WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 200`).all(params)
  return res.json({ data: rows })
})

apiRouter.post('/requests', requireAuth, (req: AuthRequest, res) => {
  const parsed = createRequestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors })
  const id = randomUUID()
  const now = new Date().toISOString()
  const item = { ...parsed.data, id, userId: req.userId!, status: 'Aberta', createdAt: now, updatedAt: now }
  db.prepare(`INSERT INTO requests (id, user_id, title, description, category, status, priority, created_at, updated_at)
    VALUES (@id, @userId, @title, @description, @category, @status, @priority, @createdAt, @updatedAt)`).run(item)
  return res.status(201).json({ data: item })
})

apiRouter.patch('/requests/:id', requireAuth, (req: AuthRequest, res) => {
  const parsed = updateRequestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Dados inválidos.', details: parsed.error.flatten() })
  const current = db.prepare('SELECT id FROM requests WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!current) return res.status(404).json({ error: 'Solicitação não encontrada.' })
  const updates = parsed.data
  const fields: string[] = []
  const params: Record<string, string> = { id: String(req.params.id), userId: req.userId!, updatedAt: new Date().toISOString() }
  if (updates.status) { fields.push('status = @status'); params.status = updates.status }
  if (updates.priority) { fields.push('priority = @priority'); params.priority = updates.priority }
  fields.push('updated_at = @updatedAt')
  db.prepare(`UPDATE requests SET ${fields.join(', ')} WHERE id = @id AND user_id = @userId`).run(params)
  const data = db.prepare(`SELECT id, title, description, category, status, priority, created_at as createdAt, updated_at as updatedAt
    FROM requests WHERE id = ? AND user_id = ?`).get(req.params.id, req.userId)
  return res.json({ data })
})

apiRouter.delete('/requests/:id', requireAuth, (req: AuthRequest, res) => {
  const result = db.prepare('DELETE FROM requests WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
  if (!result.changes) return res.status(404).json({ error: 'Solicitação não encontrada.' })
  return res.status(204).send()
})

// Suporta tanto requisições enviadas com prefixo /api quanto sem o prefixo (conforme reescrita da Vercel)
app.use('/api', apiRouter)
app.use('/', apiRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  return res.status(500).json({ error: 'Erro interno. Tente novamente.' })
})
