 # AstaRent — Платформа аренды жилья в Астане

Современное full-stack веб-приложение для поиска и размещения жилья в аренду в Астане. Разработано в рамках производственной практики.

##  Ссылки

| | |
|---|---|
| **Сайт** | https://asterent-mu.vercel.app |
| **Backend API** | https://astarent-backend.onrender.com |
| **GitHub** | https://github.com/muratovislam789-sos/Asterent |

##  Технологический стек

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS
- Zustand (стейт-менеджмент)
- Framer Motion (анимации)
- Socket.io-client (WebSocket)
- Axios

**Backend:**
- Node.js + Express + TypeScript
- Clean Architecture (controllers → services → repositories → models)
- Socket.io (WebSocket чат в реальном времени)
- JWT + Refresh Token (авторизация)
- Multer + Cloudinary (загрузка фото)

**Инфраструктура:**
- PostgreSQL — [Neon](https://neon.tech) (облачная БД)
- Хранение фото — [Cloudinary](https://cloudinary.com)
- Frontend деплой — [Vercel](https://vercel.com)
- Backend деплой — [Render](https://render.com)

## Архитектура проекта

```
AstaRent_NEW/
├── astarent-backend/
│   └── src/
│       ├── controllers/   # HTTP-запросы/ответы
│       ├── services/      # Бизнес-логика
│       ├── repositories/  # Работа с БД
│       ├── models/        # TypeScript типы
│       ├── middleware/    # Auth, upload
│       ├── routes/        # URL-маршруты
│       └── config/        # БД, Cloudinary
└── astarent-frontend/
    └── src/
        ├── pages/         # Страницы
        ├── components/    # UI компоненты
        ├── store/         # Zustand стейт
        └── api/           # Axios запросы
```

##  Реализованный функционал

- Регистрация/вход (роли: Арендатор / Арендодатель)
- Личный кабинет с загрузкой фото профиля
- Создание, редактирование, удаление объявлений
- Загрузка до 10 фото через Cloudinary
- Поиск с фильтрами (цена, район, тип, удобства)
- Сортировка (новые, цена, рейтинг)
- Детальная страница с галереей фото
- Избранное
- Чат в реальном времени (WebSocket)
- История просмотров
- Система рейтингов и отзывов об арендодателях
- Плавные анимации (Framer Motion)
- Адаптивный дизайн (мобильный + десктоп)

##  Локальный запуск

### Требования
- Node.js 18+
- Аккаунты: Neon, Cloudinary

### 1. Клонировать репозиторий
```bash
git clone https://github.com/muratovislam789-sos/Asterent.git
cd Asterent/AstaRent_NEW
```

### 2. Настроить Backend
```bash
cd astarent-backend
npm install
```

Создай файл `.env`:
```env
DATABASE_URL=твоя_строка_подключения_neon
JWT_SECRET=минимум_32_символа
JWT_REFRESH_SECRET=другой_секрет_минимум_32
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=твой_cloud_name
CLOUDINARY_API_KEY=твой_api_key
CLOUDINARY_API_SECRET=твой_api_secret
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

Создать таблицы в БД:
```bash
npm run migrate
```

Запустить:
```bash
npm run dev
```

### 3. Настроить Frontend
```bash
cd ../astarent-frontend
npm install
```

Создай файл `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Запустить:
```bash
npm run dev
```

### 4. Открыть в браузере
```
http://localhost:5173
```

##  API Эндпоинты

### Auth `/api/auth`
| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/register` | Регистрация |
| POST | `/login` | Вход |
| POST | `/refresh` | Обновить токен |
| POST | `/logout` | Выход |
| GET | `/me` | Текущий пользователь |
| PUT | `/profile` | Обновить профиль |

### Listings `/api/listings`
| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/` | Список с фильтрами |
| GET | `/:id` | Детали объявления |
| POST | `/` | Создать |
| PUT | `/:id` | Редактировать |
| DELETE | `/:id` | Удалить |
| POST | `/:id/favorite` | Избранное |

### Chats `/api/chats`
| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/` | Все чаты |
| POST | `/` | Начать чат |
| GET | `/:id/messages` | Сообщения |

### Reviews `/api/reviews`
| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/` | Оставить отзыв |
| GET | `/landlord/:id` | Отзывы арендодателя |

### History `/api/history`
| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/` | История просмотров |
| DELETE | `/` | Очистить историю |

## Cкриншоты

<img width="1247" height="768" alt="Снимок экрана 2026-06-25 005337" src="https://github.com/user-attachments/assets/0a802360-c228-47d3-95ad-e64ace6e2708" />

<img width="1256" height="766" alt="Снимок экрана 2026-06-25 005407" src="https://github.com/user-attachments/assets/55b929f5-187e-4702-887f-43b4aba3c615" />

<img width="1253" height="764" alt="Снимок экрана 2026-06-25 005420" src="https://github.com/user-attachments/assets/97826664-25b5-4587-b014-b1dd241def1c" />

<img width="1252" height="772" alt="Снимок экрана 2026-06-25 005946" src="https://github.com/user-attachments/assets/2b7d325d-aaca-4e3f-8714-50d6fbd204b2" />

<img width="1251" height="767" alt="Снимок экрана 2026-06-25 013301" src="https://github.com/user-attachments/assets/3cfa4645-7940-4f4d-8d4a-3c1b569189d0" />

<img width="1250" height="769" alt="Снимок экрана 2026-06-25 011253" src="https://github.com/user-attachments/assets/a3ec4ee2-eb3a-4b03-8983-1c27814c89bd" />

## ссылка на figma: 

https://www.figma.com/design/mI2EX77HeMrHjBlOViHhbD/Untitled?node-id=0-1&t=KFOUSbidElsPK2PE-1










