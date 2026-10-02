# deploy

Готовые сборки для хостинга mehmon-yordam.uz (webspace.uz). Не редактировать вручную —
ветка перезаписывается при каждом деплое.

- `api/bundle.js` — бэкенд (NestJS) одним файлом → `~/guide_api/bundle.js`
- `guide-frontend/` → `~/domains/mehmon-yordam.uz/public_html`
- `admin-frontend/` → `~/domains/admin.mehmon-yordam.uz/public_html`

Секреты (`.env`) хранятся только на сервере. См. DEPLOY.md в проекте.
