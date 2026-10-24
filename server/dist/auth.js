import jwt from 'jsonwebtoken';
export function signToken(userId) {
    const secret = process.env.JWT_SECRET || 'project';
    return jwt.sign({ sub: userId }, secret, { expiresIn: '8h', issuer: 'atendeflow' });
}
export function requireAuth(req, res, next) {
    const token = req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token)
        return res.status(401).json({ error: 'Autenticação necessária.' });
    try {
        const secret = process.env.JWT_SECRET || 'project';
        const payload = jwt.verify(token, secret, { issuer: 'atendeflow' });
        if (typeof payload === 'string' || typeof payload.sub !== 'string') {
            return res.status(401).json({ error: 'Token inválido.' });
        }
        req.userId = payload.sub;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}
