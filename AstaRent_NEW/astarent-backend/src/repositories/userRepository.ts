import pool from '../config/database'
import bcrypt from 'bcryptjs'

export interface User {
  id: string; name: string; email: string; password?: string
  phone?: string; avatar?: string; role: string
  created_at: string; updated_at: string
}

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    return rows[0] || null
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT id, name, email, phone, avatar, role, created_at, updated_at FROM users WHERE id = $1', [id]
    )
    return rows[0] || null
  },

  async create(name: string, email: string, password: string, role: string): Promise<User> {
    const hashed = await bcrypt.hash(password, 12)
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, phone, avatar, created_at',
      [name, email, hashed, role]
    )
    return rows[0]
  },

  async update(id: string, data: Partial<{ name: string; phone: string; avatar: string }>): Promise<User> {
    const fields = Object.entries(data).filter(([, v]) => v !== undefined)
    const sets = fields.map(([k], i) => `${k} = $${i + 2}`).join(', ')
    const values = fields.map(([, v]) => v)
    const { rows } = await pool.query(
      `UPDATE users SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, role, phone, avatar`,
      [id, ...values]
    )
    return rows[0]
  },

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
