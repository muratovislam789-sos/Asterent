"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.chatRepository = {
    async findOrCreate(listingId, tenantId, landlordId) {
        const existing = await database_1.default.query('SELECT * FROM chats WHERE listing_id=$1 AND tenant_id=$2 AND landlord_id=$3', [listingId, tenantId, landlordId]);
        if (existing.rows[0])
            return this.formatChat(existing.rows[0]);
        const { rows } = await database_1.default.query('INSERT INTO chats (listing_id, tenant_id, landlord_id) VALUES ($1,$2,$3) RETURNING *', [listingId, tenantId, landlordId]);
        return this.formatChat(rows[0]);
    },
    async findByUser(userId) {
        const { rows } = await database_1.default.query(`
      SELECT c.*,
        t.id as tenant_user_id, t.name as tenant_name, t.email as tenant_email, t.avatar as tenant_avatar, t.role as tenant_role,
        l.id as landlord_user_id, l.name as landlord_name, l.email as landlord_email, l.avatar as landlord_avatar, l.role as landlord_role,
        li.id as listing_listing_id, li.title as listing_title, li.photos as listing_photos, li.price as listing_price,
        m.text as last_msg_text, m.created_at as last_msg_at, m.sender_id as last_msg_sender,
        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND is_read = false AND sender_id != $1) as unread_count
      FROM chats c
      JOIN users t ON t.id = c.tenant_id
      JOIN users l ON l.id = c.landlord_id
      LEFT JOIN listings li ON li.id = c.listing_id
      LEFT JOIN LATERAL (SELECT * FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) m ON true
      WHERE c.tenant_id = $1 OR c.landlord_id = $1
      ORDER BY c.updated_at DESC
    `, [userId]);
        return rows.map(r => ({
            id: r.id, updatedAt: r.updated_at, createdAt: r.created_at,
            unreadCount: Number(r.unread_count),
            tenant: { id: r.tenant_user_id, name: r.tenant_name, email: r.tenant_email, avatar: r.tenant_avatar, role: r.tenant_role },
            landlord: { id: r.landlord_user_id, name: r.landlord_name, email: r.landlord_email, avatar: r.landlord_avatar, role: r.landlord_role },
            listing: r.listing_listing_id ? { id: r.listing_listing_id, title: r.listing_title, photos: r.listing_photos, price: Number(r.listing_price) } : null,
            lastMessage: r.last_msg_text ? { text: r.last_msg_text, createdAt: r.last_msg_at, senderId: r.last_msg_sender } : null,
        }));
    },
    async findById(id) {
        const { rows } = await database_1.default.query(`
      SELECT c.*,
        t.id as tenant_user_id, t.name as tenant_name, t.email as tenant_email, t.avatar as tenant_avatar, t.role as tenant_role,
        l.id as landlord_user_id, l.name as landlord_name, l.email as landlord_email, l.avatar as landlord_avatar, l.role as landlord_role,
        li.id as listing_listing_id, li.title as listing_title, li.photos as listing_photos, li.price as listing_price
      FROM chats c
      JOIN users t ON t.id = c.tenant_id
      JOIN users l ON l.id = c.landlord_id
      LEFT JOIN listings li ON li.id = c.listing_id
      WHERE c.id = $1
    `, [id]);
        if (!rows[0])
            return null;
        const r = rows[0];
        return {
            id: r.id, updatedAt: r.updated_at, createdAt: r.created_at,
            tenant: { id: r.tenant_user_id, name: r.tenant_name, email: r.tenant_email, avatar: r.tenant_avatar, role: r.tenant_role },
            landlord: { id: r.landlord_user_id, name: r.landlord_name, email: r.landlord_email, avatar: r.landlord_avatar, role: r.landlord_role },
            listing: r.listing_listing_id ? { id: r.listing_listing_id, title: r.listing_title, photos: r.listing_photos, price: Number(r.listing_price) } : null,
        };
    },
    async saveMessage(chatId, senderId, text) {
        const { rows } = await database_1.default.query('INSERT INTO messages (chat_id, sender_id, text) VALUES ($1,$2,$3) RETURNING *', [chatId, senderId, text]);
        await database_1.default.query('UPDATE chats SET updated_at = NOW() WHERE id = $1', [chatId]);
        const m = rows[0];
        return { id: m.id, chatId: m.chat_id, senderId: m.sender_id, text: m.text, isRead: m.is_read, createdAt: m.created_at };
    },
    async getMessages(chatId, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const { rows } = await database_1.default.query('SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3', [chatId, limit, offset]);
        return rows.map(m => ({ id: m.id, chatId: m.chat_id, senderId: m.sender_id, text: m.text, isRead: m.is_read, createdAt: m.created_at }));
    },
    async markAsRead(chatId, userId) {
        await database_1.default.query('UPDATE messages SET is_read = true WHERE chat_id = $1 AND sender_id != $2', [chatId, userId]);
    },
    formatChat(r) {
        return { id: r.id, tenantId: r.tenant_id, landlordId: r.landlord_id, listingId: r.listing_id, createdAt: r.created_at, updatedAt: r.updated_at };
    }
};
