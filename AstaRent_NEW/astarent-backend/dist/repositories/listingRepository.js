"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.listingRepository = {
    async findAll(filters = {}, userId) {
        const conditions = [];
        const values = [];
        let i = 1;
        if (filters.search) {
            conditions.push(`(l.title ILIKE $${i} OR l.description ILIKE $${i})`);
            values.push(`%${filters.search}%`);
            i++;
        }
        if (filters.district) {
            conditions.push(`l.district = $${i}`);
            values.push(filters.district);
            i++;
        }
        if (filters.rooms) {
            conditions.push(`l.rooms = $${i}`);
            values.push(filters.rooms);
            i++;
        }
        if (filters.priceMin) {
            conditions.push(`l.price >= $${i}`);
            values.push(Number(filters.priceMin));
            i++;
        }
        if (filters.priceMax) {
            conditions.push(`l.price <= $${i}`);
            values.push(Number(filters.priceMax));
            i++;
        }
        if (filters.wifi === 'true') {
            conditions.push(`l.amenities->>'wifi' = 'true'`);
        }
        if (filters.furniture === 'true') {
            conditions.push(`l.amenities->>'furniture' = 'true'`);
        }
        if (filters.washer === 'true') {
            conditions.push(`l.amenities->>'washer' = 'true'`);
        }
        const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
        const sortMap = { price_asc: 'l.price ASC', price_desc: 'l.price DESC', newest: 'l.created_at DESC' };
        const orderBy = sortMap[filters.sortBy] || 'l.created_at DESC';
        const limit = Math.min(Number(filters.limit) || 12, 50);
        const page = Math.max(Number(filters.page) || 1, 1);
        const offset = (page - 1) * limit;
        const favJoin = userId ? `LEFT JOIN favorites f ON f.listing_id = l.id AND f.user_id = '${userId}'` : '';
        const favSelect = userId ? ', CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as is_favorited' : '';
        const countRes = await database_1.default.query(`SELECT COUNT(*) FROM listings l ${where}`, values);
        const total = Number(countRes.rows[0].count);
        const res = await database_1.default.query(`
      SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.phone as landlord_phone, u.avatar as landlord_avatar, u.role as landlord_role ${favSelect}
      FROM listings l
      JOIN users u ON u.id = l.landlord_id
      ${favJoin}
      ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `, values);
        const listings = res.rows.map(formatListing);
        return { listings, total, page, totalPages: Math.ceil(total / limit) };
    },
    async findById(id, userId) {
        const favSelect = userId ? `, CASE WHEN f.user_id IS NOT NULL THEN true ELSE false END as is_favorited` : ', false as is_favorited';
        const favJoin = userId ? `LEFT JOIN favorites f ON f.listing_id = l.id AND f.user_id = '${userId}'` : '';
        const { rows } = await database_1.default.query(`
      SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.phone as landlord_phone, u.avatar as landlord_avatar, u.role as landlord_role ${favSelect}
      FROM listings l JOIN users u ON u.id = l.landlord_id ${favJoin}
      WHERE l.id = $1
    `, [id]);
        if (!rows[0])
            return null;
        await database_1.default.query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id]);
        return formatListing(rows[0]);
    },
    async findByLandlord(landlordId) {
        const { rows } = await database_1.default.query('SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.role as landlord_role FROM listings l JOIN users u ON u.id = l.landlord_id WHERE l.landlord_id = $1 ORDER BY l.created_at DESC', [landlordId]);
        return rows.map(formatListing);
    },
    async create(landlordId, data, photos) {
        const amenities = typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities;
        const { rows } = await database_1.default.query(`INSERT INTO listings (title, description, price, district, address, rooms, floor, total_floors, area, amenities, photos, landlord_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, [data.title, data.description, Number(data.price), data.district, data.address, data.rooms, Number(data.floor), Number(data.totalFloors), Number(data.area), JSON.stringify(amenities), photos, landlordId]);
        return rows[0];
    },
    async update(id, data, newPhotos) {
        const amenities = data.amenities ? (typeof data.amenities === 'string' ? JSON.parse(data.amenities) : data.amenities) : undefined;
        const photos = newPhotos && newPhotos.length > 0 ? newPhotos : undefined;
        const { rows } = await database_1.default.query(`UPDATE listings SET title=$1,description=$2,price=$3,district=$4,address=$5,rooms=$6,floor=$7,total_floors=$8,area=$9,${amenities ? 'amenities=$10,' : ''}${photos ? `photos=$${amenities ? '11' : '10'},` : ''}updated_at=NOW() WHERE id=$${amenities && photos ? '12' : amenities || photos ? '11' : '10'} RETURNING *`, [data.title, data.description, Number(data.price), data.district, data.address, data.rooms, Number(data.floor), Number(data.totalFloors), Number(data.area), ...(amenities ? [JSON.stringify(amenities)] : []), ...(photos ? [photos] : []), id]);
        return rows[0];
    },
    async delete(id) {
        await database_1.default.query('DELETE FROM listings WHERE id = $1', [id]);
    },
    async findFavorites(userId) {
        const { rows } = await database_1.default.query(`SELECT l.*, u.id as landlord_id, u.name as landlord_name, u.email as landlord_email, u.role as landlord_role, true as is_favorited
       FROM listings l JOIN users u ON u.id = l.landlord_id JOIN favorites f ON f.listing_id = l.id WHERE f.user_id = $1`, [userId]);
        return rows.map(formatListing);
    },
    async toggleFavorite(userId, listingId) {
        const { rows } = await database_1.default.query('SELECT 1 FROM favorites WHERE user_id=$1 AND listing_id=$2', [userId, listingId]);
        if (rows.length > 0) {
            await database_1.default.query('DELETE FROM favorites WHERE user_id=$1 AND listing_id=$2', [userId, listingId]);
            return false;
        }
        else {
            await database_1.default.query('INSERT INTO favorites (user_id, listing_id) VALUES ($1,$2)', [userId, listingId]);
            return true;
        }
    }
};
function formatListing(row) {
    return {
        id: row.id, title: row.title, description: row.description,
        price: Number(row.price), district: row.district, address: row.address,
        rooms: row.rooms, floor: Number(row.floor), totalFloors: Number(row.total_floors),
        area: Number(row.area), amenities: row.amenities || {}, photos: row.photos || [],
        viewsCount: Number(row.views_count), isFavorited: row.is_favorited || false,
        createdAt: row.created_at, updatedAt: row.updated_at,
        landlord: {
            id: row.landlord_id, name: row.landlord_name, email: row.landlord_email,
            phone: row.landlord_phone, avatar: row.landlord_avatar, role: row.landlord_role
        }
    };
}
