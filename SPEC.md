# SPEC: Pathfinder 2 Remaster Toolkit

## 1. Scope
Проект представляет собой набор статических страниц (`HTML + CSS + JS`) без сборщиков.
Цель: локальное ведение сущностей кампании Pathfinder 2 Remaster и работа с ancestry-данными на базе снапшота правил.

## 2. Pages
- `index.html`: точка входа и навигация.
- `character.html`: CRUD персонажей, расчёт базовых derived-статов, выбор ancestry/feats.
- `ancestries.html`: CRUD происхождений.
- `ancestry-feats.html`: CRUD черт происхождения.
- `monster.html`: CRUD монстров.
- `game.html`: CRUD игр + трекер участников боя.
- `rules.html`: ссылки на локально скачанные правила.

## 3. Data Storage
Все данные в `localStorage`:
- `pf2_characters`: список персонажей.
- `pf2_monsters`: список монстров.
- `pf2_games`: список игр и боевых участников.
- `pf2_ancestries`: список ancestry.
- `pf2_ancestry_feats`: список ancestry feats.
- `pf2_rules_data_meta`: версия инициализации default-данных.

### 3.1 Initialization and Upgrade
- Источник default-данных: `data/pf2-defaults.js` (глобальные массивы `PF2_DEFAULT_ANCESTRIES` и `PF2_DEFAULT_ANCESTRY_FEATS`).
- Резервный fallback в `rules-data.js` используется только если `pf2-defaults.js` недоступен.
- На версии `RULES_DEFAULTS_VERSION` выполняется merge default-данных в хранилище (без удаления пользовательских записей).

## 4. Ancestry Requirements
### 4.1 Predetermined ancestry list
Каждый ancestry содержит:
- `id`
- `name`
- `hp`
- `size`
- `speed`
- `boosts`
- `flaws`
- `languages`
- `trait`
- `heritage`

### 4.2 Feat selection bound to ancestry
- На `character.html` список feat фильтруется по `ancestryId`.
- Дополнительно фильтруется по `feat.level <= character.level`.

### 4.3 Editable ancestry + feats
- `ancestries.html` и `ancestry-feats.html` реализуют полный CRUD.
- Изменения сразу сохраняются в `localStorage`.

### 4.4 Feat slot rule by level
Количество ancestry feats:
- База: `1`.
- +1 на уровнях `5`, `9`, `13`, `17`.

Формула: `1 + count([5,9,13,17] <= level)`.

## 5. Rules Snapshot
Источник: `https://pf2.ru/rules`.

Локальные артефакты:
- `data/pf2_ru/snapshots/rules/index.html`
- `data/pf2_ru/snapshots/rules/**`
- `data/pf2_ru/snapshots/ancestries/**`
- `data/pf2_ru/manifest.json`

## 6. Tooling Scripts
- `scripts/download_pf2_rules.sh`
  - решает PoW anti-bot challenge;
  - скачивает `/rules` и связанные разделы;
  - скачивает ancestry detail pages;
  - обновляет `data/pf2_ru/manifest.json`.

- `scripts/generate_pf2_defaults.js`
  - парсит ancestry detail pages;
  - генерирует `data/pf2-defaults.js`;
  - собирает default-массивы ancestry и ancestry feats.

## 7. Non-Goals
- Нет серверной части и БД.
- Нет полноценного rules-engine PF2 для всех подсистем.
- Нет гарантии полноты переводов/формулировок относительно первоисточников.

## 8. Change Policy
При изменениях структуры страниц, ключей хранения, форматов данных или скриптов синхронизации этот файл должен быть обновлён.
