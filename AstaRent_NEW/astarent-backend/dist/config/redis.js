"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const store = new Map();
const sessionStore = {
    async setEx(key, seconds, value) {
        store.set(key, { value, expires: Date.now() + seconds * 1000 });
    },
    async get(key) {
        const item = store.get(key);
        if (!item)
            return null;
        if (Date.now() > item.expires) {
            store.delete(key);
            return null;
        }
        return item.value;
    },
    async del(key) { store.delete(key); }
};
const connectRedis = async () => {
    console.log('Session store ready');
};
exports.connectRedis = connectRedis;
exports.default = sessionStore;
