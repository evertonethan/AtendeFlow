import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
// Fallback em memória caso o driver nativo better-sqlite3 falhe no ambiente serverless da Vercel
class MemoryDatabase {
    users = new Map();
    requests = new Map();
    pragma(_sql) {
        return null;
    }
    exec(_sql) {
        // Tabelas já estão representadas em memória
    }
    prepare(sql) {
        const trimmed = sql.trim().replace(/\s+/g, ' ');
        // USERS: SELECT por email
        if (/SELECT\s+id\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(trimmed)) {
            return {
                get: (email) => {
                    for (const u of this.users.values()) {
                        if (u.email.toLowerCase() === String(email).toLowerCase())
                            return { id: u.id };
                    }
                    return undefined;
                },
                all: () => [],
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        if (/SELECT\s+id,\s*name,\s*email,\s*password_hash\s+FROM\s+users\s+WHERE\s+email\s*=\s*\?/i.test(trimmed)) {
            return {
                get: (email) => {
                    for (const u of this.users.values()) {
                        if (u.email.toLowerCase() === String(email).toLowerCase()) {
                            return { id: u.id, name: u.name, email: u.email, password_hash: u.password_hash };
                        }
                    }
                    return undefined;
                },
                all: () => [],
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        // USERS: SELECT por id
        if (/SELECT\s+id,\s*name,\s*email,\s*created_at\s+as\s+createdAt\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(trimmed)) {
            return {
                get: (id) => {
                    const u = this.users.get(String(id));
                    return u ? { id: u.id, name: u.name, email: u.email, createdAt: u.created_at } : undefined;
                },
                all: () => [],
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        // USERS: SELECT ALL
        if (/SELECT\s+id,\s*name,\s*email,\s*created_at\s+as\s+createdAt\s+FROM\s+users\s+ORDER\s+BY/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => Array.from(this.users.values())
                    .sort((a, b) => b.created_at.localeCompare(a.created_at))
                    .map(u => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at })),
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        // USERS: INSERT
        if (/INSERT\s+INTO\s+users/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => [],
                run: (...args) => {
                    const [id, name, email, password_hash, created_at] = args;
                    this.users.set(id, { id, name, email, password_hash, created_at });
                    return { changes: 1, lastInsertRowid: 1 };
                },
            };
        }
        // USERS: UPDATE
        if (/UPDATE\s+users\s+SET/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => [],
                run: (...args) => {
                    const [name, password_hash, id] = args;
                    const existing = this.users.get(id);
                    if (existing) {
                        existing.name = name;
                        existing.password_hash = password_hash;
                        return { changes: 1, lastInsertRowid: 0 };
                    }
                    return { changes: 0, lastInsertRowid: 0 };
                },
            };
        }
        // USERS: DELETE
        if (/DELETE\s+FROM\s+users\s+WHERE\s+id\s*=\s*\?/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => [],
                run: (id) => {
                    const deleted = this.users.delete(String(id));
                    return { changes: deleted ? 1 : 0, lastInsertRowid: 0 };
                },
            };
        }
        // REQUESTS: INSERT
        if (/INSERT\s+INTO\s+requests/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => [],
                run: (item) => {
                    const r = item;
                    this.requests.set(r.id, { ...r });
                    return { changes: 1, lastInsertRowid: 1 };
                },
            };
        }
        // REQUESTS: SELECT por id e user_id (para conferência)
        if (/SELECT\s+id\s+FROM\s+requests\s+WHERE\s+id\s*=\s*\?\s+AND\s+user_id\s*=\s*\?/i.test(trimmed)) {
            return {
                get: (id, userId) => {
                    const r = this.requests.get(String(id));
                    return r && r.user_id === String(userId) ? { id: r.id } : undefined;
                },
                all: () => [],
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        // REQUESTS: SELECT detalhado por id e user_id
        if (/SELECT\s+id,\s*title,\s*description,\s*category,\s*status,\s*priority,\s*created_at\s+as\s+createdAt,\s*updated_at\s+as\s+updatedAt\s+FROM\s+requests\s+WHERE\s+id\s*=\s*\?\s+AND\s+user_id\s*=\s*\?/i.test(trimmed)) {
            return {
                get: (id, userId) => {
                    const r = this.requests.get(String(id));
                    if (r && r.user_id === String(userId)) {
                        return {
                            id: r.id,
                            title: r.title,
                            description: r.description,
                            category: r.category,
                            status: r.status,
                            priority: r.priority,
                            createdAt: r.created_at,
                            updatedAt: r.updated_at,
                        };
                    }
                    return undefined;
                },
                all: () => [],
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        // REQUESTS: LISTAGEM com filtros
        if (/SELECT\s+id,\s*title,\s*description,\s*category,\s*status,\s*priority,\s*created_at\s+as\s+createdAt,\s*updated_at\s+as\s+updatedAt\s+FROM\s+requests\s+WHERE/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: (paramsObj) => {
                    const params = (paramsObj || {});
                    const userId = params.userId;
                    const q = params.q ? params.q.replace(/%/g, '').toLowerCase() : '';
                    const status = params.status;
                    const priority = params.priority;
                    let list = Array.from(this.requests.values()).filter(r => r.user_id === userId);
                    if (status)
                        list = list.filter(r => r.status === status);
                    if (priority)
                        list = list.filter(r => r.priority === priority);
                    if (q) {
                        list = list.filter(r => r.title.toLowerCase().includes(q) ||
                            r.description.toLowerCase().includes(q) ||
                            r.category.toLowerCase().includes(q));
                    }
                    return list
                        .sort((a, b) => b.created_at.localeCompare(a.created_at))
                        .slice(0, 200)
                        .map(r => ({
                        id: r.id,
                        title: r.title,
                        description: r.description,
                        category: r.category,
                        status: r.status,
                        priority: r.priority,
                        createdAt: r.created_at,
                        updatedAt: r.updated_at,
                    }));
                },
                run: () => ({ changes: 0, lastInsertRowid: 0 }),
            };
        }
        // REQUESTS: UPDATE
        if (/UPDATE\s+requests\s+SET/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => [],
                run: (paramsObj) => {
                    const params = (paramsObj || {});
                    const id = params.id;
                    const userId = params.userId;
                    const r = this.requests.get(id);
                    if (r && r.user_id === userId) {
                        if (params.status)
                            r.status = params.status;
                        if (params.priority)
                            r.priority = params.priority;
                        if (params.updated_at)
                            r.updated_at = params.updated_at;
                        return { changes: 1, lastInsertRowid: 0 };
                    }
                    return { changes: 0, lastInsertRowid: 0 };
                },
            };
        }
        // REQUESTS: DELETE
        if (/DELETE\s+FROM\s+requests\s+WHERE\s+id\s*=\s*\?\s+AND\s+user_id\s*=\s*\?/i.test(trimmed)) {
            return {
                get: () => undefined,
                all: () => [],
                run: (id, userId) => {
                    const r = this.requests.get(String(id));
                    if (r && r.user_id === String(userId)) {
                        this.requests.delete(String(id));
                        return { changes: 1, lastInsertRowid: 0 };
                    }
                    return { changes: 0, lastInsertRowid: 0 };
                },
            };
        }
        // Fallback genérico
        return {
            get: () => undefined,
            all: () => [],
            run: () => ({ changes: 0, lastInsertRowid: 0 }),
        };
    }
}
function createDatabase() {
    try {
        const isVercel = Boolean(process.env.VERCEL ||
            process.env.VERCEL_ENV ||
            process.env.NOW_REGION ||
            process.env.AWS_LAMBDA_FUNCTION_NAME);
        let dbPath;
        if (isVercel) {
            dbPath = path.join(os.tmpdir(), 'atendeflow.sqlite');
            if (!fs.existsSync(dbPath)) {
                const seedCandidates = [
                    path.resolve(process.cwd(), 'server/data/atendeflow.sqlite'),
                    path.resolve(process.cwd(), 'data/atendeflow.sqlite'),
                ];
                for (const candidate of seedCandidates) {
                    if (fs.existsSync(candidate)) {
                        try {
                            fs.copyFileSync(candidate, dbPath);
                            break;
                        }
                        catch {
                            // segue em frente
                        }
                    }
                }
            }
        }
        else {
            const envPath = process.env.DATABASE_PATH ?? './data/atendeflow.sqlite';
            if (path.isAbsolute(envPath)) {
                dbPath = envPath;
            }
            else {
                const rootCandidate = path.resolve(process.cwd(), envPath);
                const serverCandidate = path.resolve(process.cwd(), 'server', envPath.replace(/^\.\//, ''));
                dbPath = (!fs.existsSync(rootCandidate) && fs.existsSync(serverCandidate))
                    ? serverCandidate
                    : rootCandidate;
            }
        }
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        const sqlite = new Database(dbPath);
        try {
            sqlite.pragma('journal_mode = WAL');
        }
        catch { }
        try {
            sqlite.pragma('foreign_keys = ON');
        }
        catch { }
        sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Aberta','Em andamento','Concluída')),
        priority TEXT NOT NULL CHECK(priority IN ('Baixa','Média','Alta')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_requests_user_created ON requests(user_id, created_at DESC);
    `);
        return sqlite;
    }
    catch (err) {
        console.warn('SQLite em arquivo não disponível no ambiente atual, utilizando armazenamento em memória de alta performance:', err);
        return new MemoryDatabase();
    }
}
export const db = createDatabase();
