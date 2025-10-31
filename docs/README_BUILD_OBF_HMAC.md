# OKO · Обфускация JS и HMAC-подпись лоадера (пакет)
Дата: 2025-10-31

## Что это
- **Обфускация**: сборка минифицированных и обфусцированных версий `sdk.js`, `oko-operator.js`, `oko-widget.js` в `dist/`.
- **HMAC**: серверная проверка подписи (`/boot`) и валидация Origin/ts/sig перед инициализацией SDK.

## Шаги
1) В корне проекта (где `package.json`) добавьте скрипты и зависимости:
```json
{
  "devDependencies": {
    "terser": "^5.36.0",
    "javascript-obfuscator": "^4.1.0"
  },
  "scripts": {
    "build:obf": "node tools/obfuscate.js"
  }
}
```

2) Скопируйте файлы:
- `tools/obfuscate.js`
- `tools/obfuscate.config.json`
- `server/hmac/verify.js`
- `server/hmac/index.hmac.example.js` (пример заменителя `server/index.js` с /boot и проверкой хендшейка)
- `public/oko-loader.hmac.example.js` (пример лоадера с HMAC-запросом /boot)

3) Установите зависимости и запустите сборку:
```bash
npm i
npm run build:obf
```
Результат появится в `dist/`:
```
dist/
  sdk.min.obf.js
  oko-operator.min.obf.js
  oko-widget.min.obf.js
```

4) Подключайте в CDN обфусцированные версии. Например:
```html
<script defer src="https://cdn.pokazon.ru/oko/sdk.min.obf.js?v=prod"></script>
<script defer src="https://cdn.pokazon.ru/oko/oko-widget.min.obf.js?v=prod"></script>
<script defer src="https://cdn.pokazon.ru/oko/oko-operator.min.obf.js?v=prod"></script>
```

5) Включите HMAC на сервере:
- Переименуйте `server/hmac/index.hmac.example.js` → `server/index.js` (или интегрируйте изменения в существующий файл).
- Добавьте переменные окружения:
  - `HMAC_SECRET` — строка, общий секрет.
  - `CORS_ORIGIN` — список разрешённых Origin через запятую.
  - `OPERATOR_SECRET` — опционально: пароль оператора.
- Перезапустите сервер.

6) Включите HMAC в лоадере:
- Возьмите `public/oko-loader.hmac.example.js` за основу вашего `oko-loader.js`.
- Проставьте `API_ORIGIN` (например, `https://api.pokazon.ru`).
- После этого SDK не инициализируется, если `/boot` не подтвердил подпись.

---

## Важные замечания
- Обфускация — не «броня», а усложнение чтения кода. Основная защита — **серверная проверка**.
- В рамках анти-leech стратегии включите rate-limit на `/boot` и на socket.io подключение, логируйте подозрительные Origin/IP.
- При обновлении версий меняйте `?v=` в ссылках — для обхода кэша CDN.
