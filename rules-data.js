const RULES_STORAGE_KEYS = {
  ancestries: "pf2_ancestries",
  ancestryFeats: "pf2_ancestry_feats",
  dataMeta: "pf2_rules_data_meta",
};

const RULES_DEFAULTS_VERSION = 2;

const FALLBACK_ANCESTRIES = [
  {
    id: "human",
    name: "Человек",
    hp: 8,
    size: "Средний",
    speed: 25,
    boosts: ["Свободный", "Свободный"],
    flaws: [],
    languages: ["Всеобщий", "Дополнительные по Интеллекту"],
    trait: "Человек",
    heritage: "Разносторонний",
  },
  {
    id: "elf",
    name: "Эльф",
    hp: 6,
    size: "Средний",
    speed: 30,
    boosts: ["DEX", "INT", "Свободный"],
    flaws: ["CON"],
    languages: ["Всеобщий", "Эльфийский"],
    trait: "Эльф",
    heritage: "Древний эльф",
  },
  {
    id: "dwarf",
    name: "Дварф",
    hp: 10,
    size: "Средний",
    speed: 20,
    boosts: ["CON", "WIS", "Свободный"],
    flaws: ["CHA"],
    languages: ["Всеобщий", "Дварфийский"],
    trait: "Дварф",
    heritage: "Каменный дварф",
  },
  {
    id: "goblin",
    name: "Гоблин",
    hp: 6,
    size: "Маленький",
    speed: 25,
    boosts: ["DEX", "CHA", "Свободный"],
    flaws: ["WIS"],
    languages: ["Всеобщий", "Гоблинский"],
    trait: "Гоблин",
    heritage: "Углежог",
  }
];

const FALLBACK_ANCESTRY_FEATS = [
  { id: "natural-ambition", ancestryId: "human", name: "Природные амбиции", level: 1, description: "Дополнительный классовый фит 1 уровня." },
  { id: "cooperative-nature", ancestryId: "human", name: "Покладистый", level: 1, description: "Бонус к действию Aid." },
  { id: "nimble-elf", ancestryId: "elf", name: "Проворный эльф", level: 1, description: "Скорость +5 футов." },
  { id: "elven-lore", ancestryId: "elf", name: "Эльфийская ученость", level: 1, description: "Дополнительные тренировки навыков." },
  { id: "dwarven-lore", ancestryId: "dwarf", name: "Дварфийская ученость", level: 1, description: "Дополнительные тренировки навыков." },
  { id: "rock-runner", ancestryId: "dwarf", name: "Бег по камню", level: 1, description: "Легче движение по камням и щебню." },
  { id: "goblin-scuttle", ancestryId: "goblin", name: "Гоблинская перебежка", level: 1, description: "Реакцией Step вслед за союзником." },
  { id: "burn-it", ancestryId: "goblin", name: "Жги!", level: 1, description: "Усиление огненных эффектов." }
];

const DEFAULT_ANCESTRIES = Array.isArray(globalThis.PF2_DEFAULT_ANCESTRIES) && globalThis.PF2_DEFAULT_ANCESTRIES.length
  ? globalThis.PF2_DEFAULT_ANCESTRIES
  : FALLBACK_ANCESTRIES;

const DEFAULT_ANCESTRY_FEATS = Array.isArray(globalThis.PF2_DEFAULT_ANCESTRY_FEATS) && globalThis.PF2_DEFAULT_ANCESTRY_FEATS.length
  ? globalThis.PF2_DEFAULT_ANCESTRY_FEATS
  : FALLBACK_ANCESTRY_FEATS;

function toArray(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((v) => v.trim()).filter(Boolean);
  return [];
}

function normalizeAncestry(item, idx) {
  const id = String(item?.id || item?.code || `ancestry-${idx + 1}`).trim();
  return {
    id,
    name: String(item?.name || item?.title || id).trim(),
    hp: Number(item?.hp) || 6,
    size: String(item?.size || "Средний").trim(),
    speed: Number(item?.speed) || 25,
    boosts: toArray(item?.boosts),
    flaws: toArray(item?.flaws),
    languages: toArray(item?.languages),
    trait: String(item?.trait || "").trim(),
    heritage: String(item?.heritage || "").trim(),
  };
}

function normalizeFeat(item, idx) {
  const id = String(item?.id || item?.code || `feat-${idx + 1}`).trim();
  return {
    id,
    ancestryId: String(item?.ancestryId || item?.ancestry || "").trim(),
    name: String(item?.name || item?.title || id).trim(),
    level: Number(item?.level) || 1,
    description: String(item?.description || item?.desc || "").trim(),
  };
}

function mergeDefaults(defaults, existing, normalizeItem) {
  const merged = new Map(defaults.map((item, idx) => {
    const normalized = normalizeItem(item, idx);
    return [normalized.id, normalized];
  }));

  existing.map(normalizeItem).forEach((item) => {
    merged.set(item.id, item);
  });

  return [...merged.values()];
}

function ensureRulesData() {
  const storedAncestries = readStorage(RULES_STORAGE_KEYS.ancestries, null);
  const storedFeats = readStorage(RULES_STORAGE_KEYS.ancestryFeats, null);
  const meta = readStorage(RULES_STORAGE_KEYS.dataMeta, { version: 0 });

  const hasData = Array.isArray(storedAncestries) && storedAncestries.length > 0 && Array.isArray(storedFeats) && storedFeats.length > 0;
  if (!hasData) {
    writeStorage(RULES_STORAGE_KEYS.ancestries, DEFAULT_ANCESTRIES.map(normalizeAncestry));
    writeStorage(RULES_STORAGE_KEYS.ancestryFeats, DEFAULT_ANCESTRY_FEATS.map(normalizeFeat));
    writeStorage(RULES_STORAGE_KEYS.dataMeta, { version: RULES_DEFAULTS_VERSION });
    return;
  }

  const currentVersion = Number(meta?.version) || 0;
  if (currentVersion < RULES_DEFAULTS_VERSION) {
    const mergedAncestries = mergeDefaults(DEFAULT_ANCESTRIES, storedAncestries, normalizeAncestry);
    const mergedFeats = mergeDefaults(DEFAULT_ANCESTRY_FEATS, storedFeats, normalizeFeat);
    writeStorage(RULES_STORAGE_KEYS.ancestries, mergedAncestries);
    writeStorage(RULES_STORAGE_KEYS.ancestryFeats, mergedFeats);
    writeStorage(RULES_STORAGE_KEYS.dataMeta, { version: RULES_DEFAULTS_VERSION });
  }
}

function loadAncestries() {
  ensureRulesData();
  const ancestries = readStorage(RULES_STORAGE_KEYS.ancestries, []);
  const normalized = Array.isArray(ancestries) ? ancestries.map(normalizeAncestry) : DEFAULT_ANCESTRIES.map(normalizeAncestry);
  writeStorage(RULES_STORAGE_KEYS.ancestries, normalized);
  return normalized;
}

function loadAncestryFeats() {
  ensureRulesData();
  const feats = readStorage(RULES_STORAGE_KEYS.ancestryFeats, []);
  const ancestries = loadAncestries();
  const validIds = new Set(ancestries.map((a) => a.id));
  const fallbackAncestryId = ancestries[0]?.id || "human";
  const normalized = (Array.isArray(feats) ? feats : DEFAULT_ANCESTRY_FEATS)
    .map(normalizeFeat)
    .map((feat) => ({
      ...feat,
      ancestryId: validIds.has(feat.ancestryId) ? feat.ancestryId : fallbackAncestryId,
    }));
  writeStorage(RULES_STORAGE_KEYS.ancestryFeats, normalized);
  return normalized;
}
