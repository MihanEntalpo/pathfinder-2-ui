const RULES_STORAGE_KEYS = {
  ancestries: "pf2_ancestries",
  ancestryFeats: "pf2_ancestry_feats",
};

const DEFAULT_ANCESTRIES = [
  {
    id: "human",
    name: "Human",
    hp: 8,
    size: "Средний",
    speed: 25,
    boosts: ["Свободный", "Свободный"],
    flaws: [],
    languages: ["Всеобщий", "Дополнительные по Интеллекту"],
    trait: "Human",
    heritage: "Versatile Heritage",
  },
  {
    id: "elf",
    name: "Elf",
    hp: 6,
    size: "Средний",
    speed: 30,
    boosts: ["Dex", "Int", "Свободный"],
    flaws: ["Con"],
    languages: ["Всеобщий", "Эльфийский"],
    trait: "Elf",
    heritage: "Ancient Elf",
  },
  {
    id: "dwarf",
    name: "Dwarf",
    hp: 10,
    size: "Средний",
    speed: 20,
    boosts: ["Con", "Wis", "Свободный"],
    flaws: ["Cha"],
    languages: ["Всеобщий", "Дварфийский"],
    trait: "Dwarf",
    heritage: "Rock Dwarf",
  },
  {
    id: "goblin",
    name: "Goblin",
    hp: 6,
    size: "Маленький",
    speed: 25,
    boosts: ["Dex", "Cha", "Свободный"],
    flaws: ["Wis"],
    languages: ["Всеобщий", "Гоблинский"],
    trait: "Goblin",
    heritage: "Charhide Goblin",
  }
];

const DEFAULT_ANCESTRY_FEATS = [
  { id: "natural-ambition", ancestryId: "human", name: "Natural Ambition", level: 1, description: "Получите дополнительный классовый фит 1 уровня." },
  { id: "cooperative-nature", ancestryId: "human", name: "Cooperative Nature", level: 1, description: "+4 circumstance бонус к Aid." },
  { id: "nimble-elf", ancestryId: "elf", name: "Nimble Elf", level: 1, description: "Скорость +5 футов." },
  { id: "elven-lore", ancestryId: "elf", name: "Elven Lore", level: 1, description: "Тренирован в Arcana и Nature." },
  { id: "dwarven-lore", ancestryId: "dwarf", name: "Dwarven Lore", level: 1, description: "Тренирован в Crafting и Dwarven Lore." },
  { id: "rock-runner", ancestryId: "dwarf", name: "Rock Runner", level: 1, description: "Игнорируете сложную местность камня/щебня." },
  { id: "goblin-scuttle", ancestryId: "goblin", name: "Goblin Scuttle", level: 1, description: "Реакцией шаг после перемещения союзника." },
  { id: "burn-it", ancestryId: "goblin", name: "Burn It!", level: 1, description: "Усиление огненных заклинаний и алхимии." }
];

function ensureRulesData() {
  const ancestries = readStorage(RULES_STORAGE_KEYS.ancestries, null);
  if (!Array.isArray(ancestries) || ancestries.length === 0) {
    writeStorage(RULES_STORAGE_KEYS.ancestries, DEFAULT_ANCESTRIES);
  }

  const feats = readStorage(RULES_STORAGE_KEYS.ancestryFeats, null);
  if (!Array.isArray(feats) || feats.length === 0) {
    writeStorage(RULES_STORAGE_KEYS.ancestryFeats, DEFAULT_ANCESTRY_FEATS);
  }
}

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

function loadAncestries() {
  ensureRulesData();
  const ancestries = readStorage(RULES_STORAGE_KEYS.ancestries, []);
  const normalized = Array.isArray(ancestries) ? ancestries.map(normalizeAncestry) : DEFAULT_ANCESTRIES;
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
