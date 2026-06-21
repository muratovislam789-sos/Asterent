import pool from '../config/database'

export const viewHistoryRepository = {
  // Записывает просмотр объявления. Если уже смотрел раньше — просто обновляет дату.
  async recordView(userId: string, listingId: string) {
    await pool.query(
      `INSERT INTO views_history (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id)
       DO UPDATE SET viewed_at = NOW()`,
      [userId, listingId]
    )
  },

  async findByUser(userId: string) {
    const { rows } = await pool.query(`
      SELECT
        v.viewed_at,
        l.id, l.title, l.description, l.price, l.district, l.address,
        l.rooms, l.floor, l.total_floors, l.area, l.amenities, l.photos,
        l.views_count, l.created_at, l.updated_at,
        u.id as landlord_id, u.name as landlord_name, u.email as landlord_email,
        u.phone as landlord_phone, u.avatar as landlord_avatar, u.role as landlord_role
      FROM views_history v
      JOIN listings l ON l.id = v.listing_id
      JOIN users u ON u.id = l.landlord_id
      WHERE v.user_id = $1
      ORDER BY v.viewed_at DESC
      LIMIT 50
    `, [userId])

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: Number(row.price),
      district: row.district,
      address: row.address,
      rooms: row.rooms,
      floor: Number(row.floor),
      totalFloors: Number(row.total_floors),
      area: Number(row.area),
      amenities: row.amenities || {},
      photos: row.photos || [],
      viewsCount: Number(row.views_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      viewedAt: row.viewed_at,
      landlord: {
        id: row.landlord_id,
        name: row.landlord_name,
        email: row.landlord_email,
        phone: row.landlord_phone,
        avatar: row.landlord_avatar,
        role: row.landlord_role,
      },
    }))
  },

  async clear(userId: string) {
    await pool.query('DELETE FROM views_history WHERE user_id = $1', [userId])
  },
}
