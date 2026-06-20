"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.userRepository = {
    async findByEmail(email) {
        const { rows } = await database_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0] || null;
    },
    async findById(id) {
        const { rows } = await database_1.default.query('SELECT id, name, email, phone, avatar, role, created_at, updated_at FROM users WHERE id = $1', [id]);
        return rows[0] || null;
    },
    async create(name, email, password, role) {
        const hashed = await bcryptjs_1.default.hash(password, 12);
        const { rows } = await database_1.default.query('INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, email, role, phone, avatar, created_at', [name, email, hashed, role]);
        return rows[0];
    },
    async update(id, data) {
        const fields = Object.entries(data).filter(([, v]) => v !== undefined);
        const sets = fields.map(([k], i) => `${k} = $${i + 2}`).join(', ');
        const values = fields.map(([, v]) => v);
        const { rows } = await database_1.default.query(`UPDATE users SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING id, name, email, role, phone, avatar`, [id, ...values]);
        return rows[0];
    },
    async comparePassword(plain, hashed) {
        return bcryptjs_1.default.compare(plain, hashed);
    }
};
