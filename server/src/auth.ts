import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

export function signToken(userId: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não configurado')
  return jwt.sign({ sub: userId }, secret, { expiresIn: '8h', issuer: 'atendeflow' })
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return res.status(401).json({ error: 'Autenticação necessária.' })
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET não configurado')
    const payload = jwt.verify(token, secret, { issuer: 'atendeflow' })
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return res.status(401).json({ error: 'Token inválido.' })
    }
    req.userId = payload.sub
    return next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}