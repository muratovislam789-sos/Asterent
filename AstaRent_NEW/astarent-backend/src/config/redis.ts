const store = new Map<string, { value: string; expires: number }>()

const sessionStore = {
  async setEx(key: string, seconds: number, value: string) {
    store.set(key, { value, expires: Date.now() + seconds * 1000 })
  },
  async get(key: string): Promise<string | null> {
    const item = store.get(key)
    if (!item) return null
    if (Date.now() > item.expires) { store.delete(key); return null }
    return item.value
  },
  async del(key: string) { store.delete(key) }
}

export const connectRedis = async () => {
  console.log('Session store ready')
}

export default sessionStore
