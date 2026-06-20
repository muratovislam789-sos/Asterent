import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'astarent',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123',
      ssl: false,
    })

pool.on('connect', () => console.log('PostgreSQL connected'))
pool.on('error', (err) => console.error('PostgreSQL error:', err))

export default pool
