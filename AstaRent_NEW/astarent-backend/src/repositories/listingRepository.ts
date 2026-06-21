import pool from '../config/database'

export const listingRepository = {
  async findAll(filters: any = {}, userId?: string) {
    const conditions: string[] = []
    const values: any[] = []
    let i = 1

    if (filters.search) { conditions.push(`(l.title ILIKE $${i} OR l.description ILIKE $${i})`); values.push(`%${filters.search}%`); i++ }
    if (filters.district) { conditions.push(`l.district = $${i}`); values.push(filters.district); i++ }
    if (filters.rooms) { conditions.push(`l.rooms = $${i}`); values.push(filters.rooms); i++ }
    if (filters.priceMin) { conditions.push(`l.price >= $${i}`); values.push(Number(filters.priceMin)); i++ }
    if (filters.priceMax) { conditions.push(`l.price <= $${i}`); values.push(Number(filters.priceMax)); i++ }
    if (filters.wifi === 'true') { conditions.push(`l.amenities->>'wifi' = 'true'`) }
    if (filters.furniture === 'true') { conditions.push(`l.amenities->>'furniture' = 'true'`) }
    if (filters.washer === 'true') { conditions.push(`l.amenities->>'washer' = 'true'`) }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

    // Сортировка по рейтингу учитывает средний рейтинг арендодателя (через LEFT JOIN на reviews).
    // Объявления арендодателей без отзывов уходят в конец (COALESCE с 0).
    const sortMap: any = {
      price_asc: 'l.price ASC',
      price_desc: 'l.price DESC',
      newest: 'l.created_at DESC',
      rating: 'avg_landlord_rating DESC NULLS LAST, l.created_at DESC',
    }
    const orderBy = sortMap[filters.sortBy] || 'l.created_at DESC'

    const limit = Math.min(Number(filters.limit) || 12, 50)
    const page = Math.max(Number(filters.page) || 1, 1)
    const offset = (page - 1) * limit

    const favJoin = userId ? `LEFT JOIN favorites f ON f.listing_id = l.id AND f.user_id = '${userId}'` : ''
    const favSelect = userId ? ', CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as is_favorited' : ''

    const countRes = await pool.query(`SELECT COUNT(*) FROM listings l ${where}`, values)
    const total = Number(countRes.rows[0].count)

    const res = await pool.query(`
      SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.phone as landlord_phone, u.avatar as landlord_avatar, u.role as landlord_role ${favSelect},
        COALESCE(rv.avg_rating, 0) as avg_landlord_rating, COALESCE(rv.review_count, 0) as landlord_review_count
      FROM listings l
      JOIN users u ON u.id = l.landlord_id
      ${favJoin}
      LEFT JOIN (
        SELECT landlord_id, AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM reviews GROUP BY landlord_id
      ) rv ON rv.landlord_id = l.landlord_id
      ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `, values)

    const listings = res.rows.map(formatListing)
    return { listings, total, page, totalPages: Math.ceil(total / limit) }
  },

  async findById(id: string, userId?: string) {
    const favSelect = userId ? `, CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as is_favorited` : ', false as is_favorited'
    const favJoin = userId ? `LEFT JOIN favorites f ON f.listing_id = l.id AND f.user_id = '${userId}'` : ''
    const { rows } = await pool.query(`
      SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.phone as landlord_phone, u.avatar as landlord_avatar, u.role as landlord_role ${favSelect},
        COALESCE(rv.avg_rating, 0) as avg_landlord_rating, COALESCE(rv.review_count, 0) as landlord_review_count
      FROM listings l JOIN users u ON u.id = l.landlord_id ${favJoin}
      LEFT JOIN (
        SELECT landlord_id, AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM reviews GROUP BY landlord_id
      ) rv ON rv.landlord_id = l.landlord_id
      WHERE l.id = $1
    `, [id])
    if (!rows[0]) return null
    await pool.query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id])
    return formatListing(rows[0])
  },

  async findByLandlord(landlordId: string) {
    const { rows } = await pool.query(
      'SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.role as landlord_role FROM listings l JOIN users u ON u.id = l.landlord_id WHERE l.landlord_id = $1 ORDER BY l.created_at DESC',
      [landlordId]
    )
    return rows.map(formatListing)
  },

  async create(landlordId: string, data: any, photos: string[]) {
    const amenities = typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities
    const { rows } = await pool.query(
      `INSERT INTO listings (title, description, price, district, address, rooms, floor, total_floors, area, amenities, photos, landlord_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [data.title, data.description, Number(data.price), data.district, data.address, data.rooms, Number(data.floor), Number(data.totalFloors), Number(data.area), JSON.stringify(amenities), photos, landlordId]
    )
    return rows[0]
  },

  async update(id: string, data: any, newPhotos?: string[]) {
    const amenities = data.amenities ? (typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities) : undefined
    const photos = newPhotos && newPhotos.length > 0 ? newPhotos : undefined
    const { rows } = await pool.query(
      `UPDATE listings SET title=$1,description=$2,price=$3,district=$4,address=$5,rooms=$6,floor=$7,total_floors=$8,area=$9,${amenities ? 'amenities=$10,' : ''}${photos ? `photos=$${amenities ? '11' : '10'},` : ''}updated_at=NOW() WHERE id=$${amenities && photos ? '12' : amenities || photos ? '11' : '10'} RETURNING *`,
      [data.title, data.description, Number(data.price), data.district, data.address, data.rooms, Number(data.floor), Number(data.totalFloors), Number(data.area), ...(amenities ? [JSON.stringify(amenities)] : []), ...(photos ? [photos] : []), id]
    )
    return rows[0]
  },

  async delete(id: string) {
    await pool.query('DELETE FROM listings WHERE id = $1', [id])
  },

  async findFavorites(userId: string) {
    const { rows } = await pool.query(
      `SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.role as landlord_role, true as is_favorited
       FROM listings l JOIN users u ON u.id = l.landlord_id JOIN favorites f ON f.listing_id = l.id WHERE f.user_id = $1`,
      [userId]
    )
    return rows.map(formatListing)
  },

  async toggleFavorite(userId: string, listingId: string): Promise<boolean> {
    const { rows } = await pool.query('SELECT 1 FROM favorites WHERE user_id=$1 AND listing_id=$2', [userId, listingId])
    if (rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE user_id=$1 AND listing_id=$2', [userId, listingId])
      return false
    } else {
      await pool.query('INSERT INTO favorites (user_id, listing_id) VALUES ($1,$2)', [userId, listingId])
      return true
    }
  }
}

function formatListing(row: any) {
  return {
    id: row.id, title: row.title, description: row.description,
    price: Number(row.price), district: row.district, address: row.address,
    rooms: row.rooms, floor: Number(row.floor), totalFloors: Number(row.total_floors),
    area: Number(row.area), amenities: row.amenities || {}, photos: row.photos || [],
    viewsCount: Number(row.views_count), isFavorited: row.is_favorited || false,
    createdAt: row.created_at, updatedAt: row.updated_at,
    landlord: {
      id: row.landlord_id, name: row.landlord_name, email: row.landlord_email,
      phone: row.landlord_phone, avatar: row.landlord_avatar, role: row.landlord_role,
      averageRating: row.avg_landlord_rating !== undefined ? Number(parseFloat(row.avg_landlord_rating).toFixed(1)) : undefined,
      reviewCount: row.landlord_review_count !== undefined ? Number(row.landlord_review_count) : undefined,
    }
  }
}
