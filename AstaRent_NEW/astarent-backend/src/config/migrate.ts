import pool from './database'

const migrate = async () => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        avatar VARCHAR(500),
        role VARCHAR(20) NOT NULL CHECK (role IN ('tenant', 'landlord')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        district VARCHAR(100) NOT NULL,
        address VARCHAR(500) NOT NULL,
        rooms VARCHAR(20) NOT NULL,
        floor INTEGER DEFAULT 1,
        total_floors INTEGER DEFAULT 9,
        area DECIMAL(8,2) NOT NULL,
        amenities JSONB DEFAULT '{}',
        photos TEXT[] DEFAULT '{}',
        landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (user_id, listing_id)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
        tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
        landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (listing_id, tenant_id, landlord_id)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_listings_landlord ON listings(landlord_id);
      CREATE INDEX IF NOT EXISTS idx_listings_district ON listings(district);
      CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
      CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    `)

    await client.query('COMMIT')
    console.log('Migration completed successfully')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', err)
    throw err
  } finally {
    client.release()
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
