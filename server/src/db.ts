import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

function getDatabasePath(): string {
  const isVercel = Boolean(
    process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  )

  // No ambiente de produção na Vercel (serverless), o sistema de arquivos é somente leitura,
  // exceto o diretório /tmp.
  if (isVercel) {
    const tmpDbPath = path.join(os.tmpdir(), 'atendeflow.sqlite')
    if (!fs.existsSync(tmpDbPath)) {
      const seedCandidates = [
        path.resolve(process.cwd(), 'server/data/atendeflow.sqlite'),
        path.resolve(process.cwd(), 'data/atendeflow.sqlite')
      ]
      for (const candidate of seedCandidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath)
            break
          } catch {
            // Prossegue criando o banco se falhar a cópia inicial
          }
        }
      }
    }
    return tmpDbPath
  }

  // Ambiente local de desenvolvimento
  const envPath = process.env.DATABASE_PATH ?? './data/atendeflow.sqlite'
  if (path.isAbsolute(envPath)) {
    return envPath
  }

  // Se executado da raiz do monorepo, dá preferência a server/data/ caso já exista
  const rootCandidate = path.resolve(process.cwd(), envPath)
  const serverCandidate = path.resolve(process.cwd(), 'server', envPath.replace(/^\.\//, ''))
  if (!fs.existsSync(rootCandidate) && fs.existsSync(serverCandidate)) {
    return serverCandidate
  }

  return rootCandidate
}

const dbPath = getDatabasePath()
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
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
`)
