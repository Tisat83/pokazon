# OKO · Миграция исходников в public/src (handoff pack)
Дата: 2025-10-31

## Что это
Набор скриптов и подсказок, чтобы перенести текущие рабочие файлы в `public/src` и дальше работать только на исходниках. Продакшн собирается в `public/dist`.

## Как использовать
1) Распакуйте архив в корень проекта (где папка public).
2) Запустите один из скриптов:
   - Windows PowerShell:
     ```powershell
     .\scripts\migrate_to_src.ps1 -ProjectRoot C:\projects\oko
     ```
   - Linux/macOS:
     ```bash
     bash scripts/migrate_to_src.sh /path/to/project
     ```
3) Скрипт скопирует найденные `public/*.js` → `public/src/*.js`. Дальше правьте только `public/src/*.js`.
4) Сборка обфусцированных файлов: см. пакет `OKO_obfuscation_and_HMAC_pack.zip` и/или `OKO_dev_src_layout_pack.zip`.

## Handoff
Смотри `docs/HANDOFF_PROMPT.txt` — это краткая инструкция следующему ассистенту/разработчику, чтобы продолжать работу без откатов назад.
