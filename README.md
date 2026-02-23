# Pathfinder 2 Remaster Toolkit (Static HTML/CSS/JS)

Статический проект без сборки/компиляторов для ведения персонажей, монстров и игровых сессий в Pathfinder 2 Remaster.

## Страницы
- `index.html` — главная навигация.
- `character.html` — создание/редактирование/просмотр персонажей.
- `ancestries.html` — CRUD-справочник происхождений (Ancestry).
- `ancestry-feats.html` — CRUD-справочник черт происхождения.
- `monster.html` — создание/редактирование/просмотр монстров.
- `game.html` — список игр и трекер боевых участников.
- `rules.html` — страница подключения локальной документации правил.

## Хранение данных
`localStorage` ключи:
- `pf2_characters`
- `pf2_monsters`
- `pf2_games`
- `pf2_ancestries`
- `pf2_ancestry_feats`
- `pf2_rules_data_meta`

## Базовые данные (JS)
Каталог `data/` разделён на тематические папки и entity-файлы:
- `data/registry.js` — служебные функции регистрации (`add_ancestry`, `add_ancestry_feat`, `add_class`, `add_background`, `add_archetype` и camelCase-алиасы).
- `data/ancestries/entities/*.js` — каждый ancestry в отдельном файле.
- `data/ancestry-feats/entities/*.js` — каждая ancestry-черта в отдельном файле.
- `data/classes/entities/*.js` — каждый класс в отдельном файле.
- `data/backgrounds/entities/*.js` — каждый background в отдельном файле.
- `data/archetypes/entities/*.js` — каждый archetype в отдельном файле.
- `data/*/load-all.js` — загрузчик файлов категории.

Порядок подключения: сначала `data/registry.js`, затем `data/*/load-all.js`, и только потом `rules-data.js`.
Файл `data/pf2-defaults.js` сохранён для обратной совместимости и как исходник для генерации.

## Реализованные требования по ancestry
1. `Ancestry` выбирается из предзаданного списка.
2. Для выбранного происхождения доступен выбор ancestry feats.
3. Происхождения и черты редактируются через отдельные интерфейсы и хранятся в `localStorage`.
4. Лимит ancestry feats на персонаже зависит от уровня: `1 +` по одной доп. черте на уровнях `5`, `9`, `13`, `17`.

## Запуск
Открой `index.html` в браузере.
