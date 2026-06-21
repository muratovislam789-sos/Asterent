import pool from '../config/database'

export const reviewRepository = {
  async create(authorId: string, landlordId: string, rating: number, comment?: string, listingId?: string) {
    const { rows } = await pool.query(
      `INSERT INTO reviews (author_id, landlord_id, listing_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [authorId, landlordId, listingId || null, rating, comment || null]
    )
    return rows[0]
  },

  async findByLandlord(landlordId: string) {
    const { rows } = await pool.query(`
      SELECT r.*, u.id as author_user_id, u.name as author_name, u.avatar as author_avatar
      FROM reviews r
      JOIN users u ON u.id = r.author_id
      WHERE r.landlord_id = $1
      ORDER BY r.created_at DESC
    `, [landlordId])

    return rows.map((row) => ({
      id: row.id,
      landlordId: row.landlord_id,
      authorId: row.author_id,
      listingId: row.listing_id,
      rating: Number(row.rating),
      comment: row.comment,
      createdAt: row.created_at,
      author: {
        id: row.author_user_id,
        name: row.author_name,
        avatar: row.author_avatar,
      },
    }))
  },

  // Возвращает средний рейтинг и количество отзывов для одного арендодателя
  async getRatingSummary(landlordId: string) {
    const { rows } = await pool.query(
      `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total
       FROM reviews WHERE landlord_id = $1`,
      [landlordId]
    )
    return {
      averageRating: Number(parseFloat(rows[0].avg_rating).toFixed(1)),
      totalReviews: Number(rows[0].total),
    }
  },

  // Возвращает средние рейтинги для НЕСКОЛЬКИХ арендодателей сразу —
  // используется при сортировке списка объявлений по рейтингу
  async getRatingSummariesForLandlords(landlordIds: string[]) {
    if (landlordIds.length === 0) return {}
    const { rows } = await pool.query(
      `SELECT landlord_id, COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total
       FROM reviews
       WHERE landlord_id = ANY($1)
       GROUP BY landlord_id`,
      [landlordIds]
    )
    const map: Record<string, { averageRating: number; totalReviews: number }> = {}
    rows.forEach((row) => {
      map[row.landlord_id] = {
        averageRating: Number(parseFloat(row.avg_rating).toFixed(1)),
        totalReviews: Number(row.total),
      }
    })
    return map
  },

  async findExisting(authorId: string, landlordId: string, listingId?: string) {
    const { rows } = await pool.query(
      `SELECT * FROM reviews WHERE author_id = $1 AND landlord_id = $2 AND listing_id IS NOT DISTINCT FROM $3`,
      [authorId, landlordId, listingId || null]
    )
    return rows[0] || null
  },
}
