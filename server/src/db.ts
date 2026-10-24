import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

const configuredPath = process.env.DATABASE_PATH ?? './data/atendeflow.sqlite'
const dbPath = path.resolve(process.cwd(), configuredPath)
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
