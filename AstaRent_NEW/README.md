
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





