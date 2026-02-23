# PF2 Rules Reference (Local Snapshot)

Источник правил: <https://pf2.ru/rules>

Актуальный локальный снапшот хранится в:
- `data/pf2_ru/snapshots/rules/index.html` (оглавление `/rules`)
- `data/pf2_ru/snapshots/rules/**` (страницы разделов правил)
- `data/pf2_ru/snapshots/ancestries/**` (страницы ancestry)
- `data/pf2_ru/manifest.json` (дата и счётчики файлов)

Обновление снапшота и встроенных default-данных:
```bash
scripts/download_pf2_rules.sh
node scripts/generate_pf2_defaults.js
```
