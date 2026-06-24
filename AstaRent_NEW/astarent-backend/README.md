# AstaRent — Backend API

Node.js + Express + TypeScript + PostgreSQL (Neon) + Cloudinary + WebSocket (Socket.io)

## Архитектура

Проект построен по принципу Clean Architecture с чётким разделением слоёв:

```
src/
├── controllers/   # Принимают HTTP-запросы, вызывают services, формируют ответ
├── services/      # Вся бизнес-логика и правила приложения
├── repositories/  # Работа с базой данных (SQL-запросы)
├── models/        # TypeScript-описания сущностей (User, Listing, Chat, Message, Favorite)
├── middleware/     # Auth-проверка, загрузка файлов
├── routes/        # Регистрация эндпоинтов
├── utils/         # JWT, единый формат ответов
└── config/        # Подключение к БД, Cloudinary, сессии
```

## Стек
- **Runtime**: Node.js 20+
- **Framework**: Express.js + TypeScript
- **БД**: PostgreSQL — облачный сервер [Neon](https://neon.tech)
- **Хранение фото**: [Cloudinary](https://cloudinary.com) (облако)
- **Real-time**: Socket.io (WebSocket)
- **Auth**: JWT + Refresh Token

## Запуск локально

### 1. Установить зависимости
```bash
cd astarent-backend
npm install
```

### 2. Настроить переменные окружения
Создай файл `.env` в корне `astarent-backend`:

```env
# PostgreSQL (Neon) — получи строку подключения на neon.tech
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# JWT
JWT_SECRET=минимум_32_символа_секретный_ключ
JWT_REFRESH_SECRET=другой_секретный_ключ_минимум_32_символа
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Сервер
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Cloudinary — получи на cloudinary.com → Dashboard
CLOUDINARY_CLOUD_NAME=твой_cloud_name
CLOUDINARY_API_KEY=твой_api_key
CLOUDINARY_API_SECRET=твой_api_secret

# Загрузка файлов
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### 3. Создать таблицы в БД
```bash
npm run migrate
```

### 4. Запустить в режиме разработки
```bash
npm run dev
```

Сервер запустится на `http://localhost:5000`

## API Эндпоинты

### Auth `/api/auth`
| Метод | URL | Описание | Auth |
|-------|-----|----------|------|
| POST | `/register` | Регистрация | — |
| POST | `/login` | Вход | — |
| POST | `/refresh` | Обновить токен | — |
| POST | `/logout` | Выход | ✓ |
| GET | `/me` | Текущий пользователь | ✓ |
| PUT | `/profile` | Обновить профиль (+фото) | ✓ |

### Listings `/api/listings`
| Метод | URL | Описание | Auth |
|-------|-----|----------|------|
| GET | `/` | Список с фильтрами | — |
| GET | `/my` | Мои объявления | Landlord |
| GET | `/favorites` | Избранное | ✓ |
| GET | `/:id` | Детали объявления | — |
| POST | `/` | Создать объявление | Landlord |
| PUT | `/:id` | Редактировать | Landlord |
| DELETE | `/:id` | Удалить | Landlord |
| POST | `/:id/favorite` | Добавить/убрать из избранного | ✓ |

#### Query параметры GET /listings
- `search` — текстовый поиск
- `district` — район (Есиль, Алматы, Сарыарка, Байконур, Нура, Другой)
- `rooms` — тип (studio, 1, 2, 3, 4+)
- `priceMin`, `priceMax` — диапазон цен
- `wifi`, `furniture`, `washer` — удобства (true)
- `sortBy` — newest | price_asc | price_desc
- `page`, `limit` — пагинация

### Chats `/api/chats`
| Метод | URL | Описание | Auth |
|-------|-----|----------|------|
| GET | `/` | Все чаты пользователя | ✓ |
| POST | `/` | Начать чат по объявлению | ✓ |
| GET | `/:id` | Информация о чате | ✓ |
| GET | `/:id/messages` | История сообщений | ✓ |
| POST | `/:id/messages` | Отправить сообщение | ✓ |

## WebSocket (Socket.io)

Подключение: `ws://localhost:5000` с `auth: { token: JWT_TOKEN }`

### События клиент → сервер
- `join_chat` `{ chatId }` — войти в комнату чата
- `send_message` `{ chatId, text }` — отправить сообщение
- `mark_read` `{ chatId }` — пометить как прочитанные

### События сервер → клиент
- `new_message` — новое сообщение в чате
- `message_sent` — подтверждение отправки

## Обработка ошибок

Все ошибки бизнес-логики выбрасываются как `AppError` (см. `services/authService.ts`) с указанием HTTP статус-кода. Контроллеры ловят `AppError` и возвращают соответствующий ответ:

```json
{ "success": false, "error": "Текст ошибки" }
```

Непредвиденные ошибки логируются в консоль и возвращают `500`.

## Деплой

Текущая инфраструктура проекта:

| Часть | Сервис |
|-------|--------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| База данных | [Neon](https://neon.tech) (PostgreSQL) |
| Хранение фото | [Cloudinary](https://cloudinary.com) |

### Render — настройка
1. New Web Service → подключить GitHub repo
2. Root Directory: `AstaRent_NEW/astarent-backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Добавить все переменные из `.env` в Environment Variables


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

CREATE TABLE IF NOT EXISTS views_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_views_history_user ON views_history(user_id);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (author_id, landlord_id, listing_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_landlord ON reviews(landlord_id);

https://www.figma.com/design/mI2EX77HeMrHjBlOViHhbD/Untitled?node-id=0-1&t=KFOUSbidElsPK2PE-1

