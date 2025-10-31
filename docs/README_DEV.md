# OKO · Dev workflow и структура исходников
Дата: 2025-10-31

## Цель
- Развиваем проект на **читабельных исходниках** в `public/src/` и `server/*`.
- В прод выкладываем **собранные артефакты** из `public/dist/` (мини+обфуск).
- Быстро переключаемся между DEV и PROD прямо с одной страницы через `?mode=dev`.

## Структура
```
public/
  src/
    sdk.js             # исходник SDK (курсор, клики, фокус, скролл, ввод...)
    oko-widget.js      # виджет клиента (Подключить/Остановить, код, копирование)
    oko-operator.js    # панель оператора (код, подгон, окно W×H, лог)
    oko-loader.js      # лоадер с режимом dev/prod
  dist/
    sdk.min.obf.js
    oko-operator.min.obf.js
    oko-widget.min.obf.js
tools/
  obfuscate.js
  obfuscate.config.json
docs/
  README_DEV.md        # этот документ
```

## Локальная разработка
1. Подключай **лоадер из src**:
   ```html
   <script defer src="/public/src/oko-loader.js?mode=dev"></script>
   ```
   Лоадер сам подтянет `/public/src/sdk.js`, `/public/src/oko-widget.js`, `/public/src/oko-operator.js`.

2. Тестируй как обычно (ПК↔ПК, ПК↔мобайл). Весь код — читаемый, удобно дебажить.

## Сборка прод-версии
1. Установи зависимости в корне проекта:
   ```bash
   npm i terser javascript-obfuscator -D
   ```
2. Добавь в `package.json`:
   ```json
   {
     "scripts": {
       "build:obf": "node tools/obfuscate.js"
     }
   }
   ```
3. Запусти:
   ```bash
   npm run build:obf
   ```
4. Залей на CDN файлы из `public/dist/` и подключай так:
   ```html
   <script defer src="https://cdn.pokazon.ru/oko/sdk.min.obf.js?v=prod"></script>
   <script defer src="https://cdn.pokazon.ru/oko/oko-widget.min.obf.js?v=prod"></script>
   <script defer src="https://cdn.pokazon.ru/oko/oko-operator.min.obf.js?v=prod"></script>
   ```

## Переключатель окружений
- DEV: `?mode=dev` → грузим из `/public/src/*` (локально/на тесте).
- PROD: по умолчанию → грузим из CDN `/oko/*.min.obf.js`.

## Sourcemaps
- В DEV при необходимости можно подключить sourcemaps.
- В PROD **не** публикуем (чтобы не облегчать реверс).

## Анти-leech (кратко)
- Обфускация — это «барьер», но главное — серверная проверка:
  - `/boot` с HMAC-подписью + белый список Origin,
  - rate-limit, логирование, лицензии по доменам.
- См. подробный `docs/ANTI_LEECH.md` (из другого пакета).

## Как работать вместе
- Ты присылаешь файлы из `public/src/` и `server/*` — я вношу правки в исходники.
- Тестим на `?mode=dev`.
- Собираем `npm run build:obf`, выкладываем `public/dist/*` на CDN.
