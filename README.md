# Pathfinder 2 Remaster Toolkit (Static HTML/CSS/JS)

Статический проект без сборки/компиляторов для ведения персонажей, монстров и игровых сессий в Pathfinder 2 Remaster.

## Страницы
- `index.html` — главная навигация.
- `character.html` — создание/редактирование/просмотр персонажей.
- `ancestries.html` — CRUD-справочник происхождений (Ancestry).
- `ancestry-feats.html` — CRUD-справочник черт происхождения.
- `monster.html` — создание/редактирование/просмотр монстров.
- `game.html` — список игр и трекер боевых участников.
- `rules.html` — вход в локальный снапшот правил PF2 (`pf2.ru`).

## Хранение данных
`localStorage` ключи:
- `pf2_characters`
- `pf2_monsters`
- `pf2_games`
- `pf2_ancestries`
- `pf2_ancestry_feats`
- `pf2_rules_data_meta`

## Реализованные требования по ancestry
1. `Ancestry` выбирается из предзаданного списка, полученного из локального снапшота `pf2.ru`.
2. Для выбранного происхождения доступен выбор предзаданных ancestry feats.
3. Происхождения и черты редактируются через отдельные интерфейсы и хранятся в `localStorage`.
4. Лимит ancestry feats на персонаже зависит от уровня: `1 +` по одной доп. черте на уровнях `5`, `9`, `13`, `17`.

## Источник правил и снапшот
- Онлайн источник: <https://pf2.ru/rules>
- Локальный снапшот: `data/pf2_ru/snapshots/`
- Manifest: `data/pf2_ru/manifest.json`
- Сводка: `data/pf2_rules_reference.md`

Скрипты обновления:
```bash
scripts/download_pf2_rules.sh
node scripts/generate_pf2_defaults.js
```

`download_pf2_rules.sh` скачивает оглавление и связанные страницы `/rules`, а также ancestry-страницы.
`generate_pf2_defaults.js` генерирует `data/pf2-defaults.js` (предзаданные ancestries + ancestry feats).

## Запуск
Открой `index.html` в браузере.
