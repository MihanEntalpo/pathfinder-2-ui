#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");

const FALLBACK_CLASSES = [
  { id: "alchemist", name: "Алхимик" },
  { id: "animist", name: "Анимист" },
  { id: "barbarian", name: "Варвар" },
  { id: "bard", name: "Бард" },
  { id: "champion", name: "Чемпион" },
  { id: "cleric", name: "Жрец" },
  { id: "druid", name: "Друид" },
  { id: "fighter", name: "Воин" },
  { id: "inventor", name: "Изобретатель" },
  { id: "investigator", name: "Следователь" },
  { id: "kineticist", name: "Кинетик" },
  { id: "magus", name: "Магус" },
  { id: "monk", name: "Монах" },
  { id: "oracle", name: "Оракул" },
  { id: "psychic", name: "Психик" },
  { id: "ranger", name: "Следопыт" },
  { id: "rogue", name: "Плут" },
  { id: "sorcerer", name: "Чародей" },
  { id: "summoner", name: "Призыватель" },
  { id: "swashbuckler", name: "Авантюрист" },
  { id: "thaumaturge", name: "Тауматург" },
  { id: "witch", name: "Ведьма" },
  { id: "wizard", name: "Волшебник" },
];

const FALLBACK_BACKGROUNDS = [
  { id: "acolyte", name: "Аколит" },
  { id: "artisan", name: "Ремесленник" },
  { id: "bounty-hunter", name: "Охотник за головами" },
  { id: "criminal", name: "Преступник" },
  { id: "detective", name: "Сыщик" },
  { id: "field-medic", name: "Полевой медик" },
  { id: "gladiator", name: "Гладиатор" },
  { id: "noble", name: "Дворянин" },
  { id: "scholar", name: "Учёный" },
  { id: "warrior", name: "Воин" },
];

const FALLBACK_ARCHETYPES = [
  { id: "acrobat", name: "Акробат" },
  { id: "archer", name: "Лучник" },
  { id: "beastmaster", name: "Повелитель зверей" },
  { id: "captain", name: "Капитан" },
  { id: "cavalier", name: "Кавалерист" },
  { id: "dandy", name: "Денди" },
  { id: "linguist", name: "Лингвист" },
  { id: "medic", name: "Медик" },
  { id: "pirate", name: "Пират" },
  { id: "wrestler", name: "Борец" },
];

function runScript(filePath, context) {
  if (!fs.existsSync(filePath)) return;
  const code = fs.readFileSync(filePath, "utf8");
  vm.runInContext(code, context, { filename: filePath });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeFileBase(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";
}

function uniqueFileBase(base, used) {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  const name = `${base}-${i}`;
  used.add(name);
  return name;
}

function writeRegistry() {
  const registryPath = path.join(dataDir, "registry.js");
  const content = `// Shared baseline registry for per-entity data files.
var PF2_CHARACTER_DATA = (globalThis.PF2_CHARACTER_DATA = globalThis.PF2_CHARACTER_DATA || {});
PF2_CHARACTER_DATA.ancestries = [];
PF2_CHARACTER_DATA.ancestryFeats = [];
PF2_CHARACTER_DATA.classes = [];
PF2_CHARACTER_DATA.backgrounds = [];
PF2_CHARACTER_DATA.archetypes = [];

function pushUnique(list, item) {
  const id = String(item?.id || "").trim();
  if (!id) return;
  const idx = list.findIndex((entry) => String(entry?.id || "").trim() === id);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
}

function add_ancestry(item) {
  pushUnique(PF2_CHARACTER_DATA.ancestries, item);
}

function add_ancestry_feat(item) {
  pushUnique(PF2_CHARACTER_DATA.ancestryFeats, item);
}

function add_class(item) {
  pushUnique(PF2_CHARACTER_DATA.classes, item);
}

function add_background(item) {
  pushUnique(PF2_CHARACTER_DATA.backgrounds, item);
}

function add_archetype(item) {
  pushUnique(PF2_CHARACTER_DATA.archetypes, item);
}

globalThis.add_ancestry = add_ancestry;
globalThis.addAncestry = add_ancestry;
globalThis.add_ancestry_feat = add_ancestry_feat;
globalThis.addAncestryFeat = add_ancestry_feat;
globalThis.add_class = add_class;
globalThis.addClass = add_class;
globalThis.add_background = add_background;
globalThis.addBackground = add_background;
globalThis.add_archetype = add_archetype;
globalThis.addArchetype = add_archetype;
`;
  fs.writeFileSync(registryPath, content, "utf8");
}

function writeCategoryFiles(config, items) {
  const categoryDir = path.join(dataDir, config.dir);
  const entitiesDir = path.join(categoryDir, "entities");
  const loadAllPath = path.join(categoryDir, "load-all.js");

  fs.rmSync(entitiesDir, { recursive: true, force: true });
  ensureDir(entitiesDir);

  const used = new Set();
  const fileNames = [];

  items.forEach((item, idx) => {
    const base = uniqueFileBase(safeFileBase(item.id || item.name || `${config.dir}-${idx + 1}`), used);
    const fileName = `${base}.js`;
    const filePath = path.join(entitiesDir, fileName);
    const payload = JSON.stringify(item, null, 2);
    const fileContent = `${config.addFn}(
${payload}
);
`;
    fs.writeFileSync(filePath, fileContent, "utf8");
    fileNames.push(fileName);
  });

  const loadAll = `// Auto-generated loader for ${config.dir}
(() => {
  const files = ${JSON.stringify(fileNames, null, 2)};
  for (const file of files) {
    document.write('<script src="data/${config.dir}/entities/' + file + '"><\\/script>');
  }
})();
`;
  fs.writeFileSync(loadAllPath, loadAll, "utf8");
}

function main() {
  const context = vm.createContext({ globalThis: {} });

  runScript(path.join(dataDir, "pf2-defaults.js"), context);
  runScript(path.join(dataDir, "ancestries", "defaults.js"), context);
  runScript(path.join(dataDir, "ancestry-feats", "defaults.js"), context);
  runScript(path.join(dataDir, "classes", "defaults.js"), context);
  runScript(path.join(dataDir, "backgrounds", "defaults.js"), context);
  runScript(path.join(dataDir, "archetypes", "defaults.js"), context);

  const g = context.globalThis || {};
  const merged = g.PF2_CHARACTER_DATA || {};
  const ancestries = Array.isArray(merged.ancestries) && merged.ancestries.length
    ? merged.ancestries
    : Array.isArray(g.PF2_DEFAULT_ANCESTRIES) ? g.PF2_DEFAULT_ANCESTRIES : [];
  const ancestryFeats = Array.isArray(merged.ancestryFeats) && merged.ancestryFeats.length
    ? merged.ancestryFeats
    : Array.isArray(g.PF2_DEFAULT_ANCESTRY_FEATS) ? g.PF2_DEFAULT_ANCESTRY_FEATS : [];
  const classes = Array.isArray(merged.classes) && merged.classes.length ? merged.classes : FALLBACK_CLASSES;
  const backgrounds = Array.isArray(merged.backgrounds) && merged.backgrounds.length ? merged.backgrounds : FALLBACK_BACKGROUNDS;
  const archetypes = Array.isArray(merged.archetypes) && merged.archetypes.length ? merged.archetypes : FALLBACK_ARCHETYPES;

  writeRegistry();
  writeCategoryFiles({ dir: "ancestries", addFn: "add_ancestry" }, ancestries);
  writeCategoryFiles({ dir: "ancestry-feats", addFn: "add_ancestry_feat" }, ancestryFeats);
  writeCategoryFiles({ dir: "classes", addFn: "add_class" }, classes);
  writeCategoryFiles({ dir: "backgrounds", addFn: "add_background" }, backgrounds);
  writeCategoryFiles({ dir: "archetypes", addFn: "add_archetype" }, archetypes);

  console.log(
    `Generated entities: ancestries=${ancestries.length}, ancestryFeats=${ancestryFeats.length}, classes=${classes.length}, backgrounds=${backgrounds.length}, archetypes=${archetypes.length}`
  );
}

main();
