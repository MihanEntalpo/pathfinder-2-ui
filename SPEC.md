# SPEC: Pathfinder 2 Remaster Toolkit

## 1. Scope
Проект представляет собой набор статических страниц (`HTML + CSS + JS`) без сборщиков.
Цель: локальное ведение сущностей кампании Pathfinder 2 Remaster и работа с ancestry-данными.

## 2. Pages
- `index.html`: точка входа и навигация.
- `character.html`: CRUD персонажей, расчёт базовых derived-статов, выбор ancestry/feats.
- `character.html` включает:
- выбор `ancestry`, `class`, `background`;
- выбор ancestry feats и class feats по уровню;
- выбор boosts от background/class с применением к базовым характеристикам.
- `ancestries.html`: CRUD происхождений.
- `ancestry-feats.html`: CRUD черт происхождения.
- `backgrounds.html`: CRUD background.
- `class-feats.html`: CRUD class feats.
- `monster.html`: CRUD монстров.
- `game.html`: CRUD игр + трекер участников боя.
- `rules.html`: точка подключения локальной документации правил.

## 3. Data Storage
Все данные в `localStorage`:
- `pf2_characters`: список персонажей.
- `pf2_monsters`: список монстров.
- `pf2_games`: список игр и боевых участников.
- `pf2_ancestries`: список ancestry.
- `pf2_ancestry_feats`: список ancestry feats.
- `pf2_backgrounds`: список background.
- `pf2_class_feats`: список class feats.
- `pf2_rules_data_meta`: версия инициализации default-данных.

### 3.1 Initialization and Upgrade
- При запуске используется набор default-данных происхождений и черт из `rules-data.js`.
- На версии `RULES_DEFAULTS_VERSION` выполняется merge default-данных в хранилище (без удаления пользовательских записей).

### 3.2 Baseline Data Files
- Базовые данные организованы как “1 сущность = 1 JS-файл” в `data/*/entities/`.
- Служебные регистраторы загружаются из `data/registry.js`:
- `add_ancestry` / `addAncestry`
- `add_ancestry_feat` / `addAncestryFeat`
- `add_class` / `addClass`
- `add_background` / `addBackground`
- `add_archetype` / `addArchetype`
- `add_class_feat` / `addClassFeat`
- Категории подключаются через `data/*/load-all.js`, который загружает все entity-файлы.
- Порядок обязателен: `data/registry.js` -> `data/*/load-all.js` -> `rules-data.js`.
- Данные `classes/backgrounds/class-feats` извлекаются из `knowledge/` скриптом `scripts/build_character_options_from_knowledge.js`.

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

## 5. External Rules Docs
- Исходный офлайн-дамп `2e.aonprd.com` хранится в `docs/aonprd/` (HTML-страницы и ассеты).
- Текстовое markdown-зеркало для обработки и поиска хранится в `knowledge/` и повторяет структуру разделов (например `knowledge/Ancestry/`, `knowledge/Action/`, `knowledge/Archetypes/`, `knowledge/Curses/` и т.д.).
- Для просмотра офлайн-энциклопедии в браузере основной вход: `docs/aonprd/index.htm`.

## 6. Non-Goals
- Нет серверной части и БД.
- Нет полноценного rules-engine PF2 для всех подсистем.
- Нет гарантии полного покрытия всех подсистем правил без внешнего справочника.

## 7. Change Policy
При изменениях структуры страниц, ключей хранения, форматов данных или flow интеграции внешней документации этот файл должен быть обновлён.
