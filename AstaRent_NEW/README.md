
https://www.figma.com/design/mI2EX77HeMrHjBlOViHhbD/Untitled?node-id=0-1&t=KFOUSbidElsPK2PE-1

====================================
  AstaRent — Запуск
====================================

ТРЕБОВАНИЯ: Node.js + pgAdmin (PostgreSQL)

ШАГ 1 — Создай базу в pgAdmin:
  Правой кнопкой на Databases → Create → Database
  Название: astarent → Save

ШАГ 2 — Открой терминал 1 (backend):
cd AstaRent_NEW\astarent-backend  
  npm install
  npm run migrate
  npm run dev

ШАГ 3 — Открой терминал 2 (frontend):
cd C:\Users\Ислам\OneDrive\Desktop\AstaRent_FINAL\AstaRent_NEW\astarent-frontend
  npm install
  npm run dev

ШАГ 4 — Открой браузер:
  http://localhost:5173

====================================
  Если пароль от PostgreSQL не 123:
  Открой astarent-backend/.env
  Измени строку: DB_PASSWORD=твой_пароль
====================================


-- ============================================
-- AstaRent — Структура базы данных
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar VARCHAR(500),
  role VARCHAR(20) NOT NULL CHECK (role IN ('tenant','landlord')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
);

CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (listing_id, tenant_id, landlord_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);


<img width="865" height="494" alt="Снимок экрана 2026-06-24 102434" src="https://github.com/user-attachments/assets/3e919818-9080-41ae-abac-1e7f9da4eab5" />
