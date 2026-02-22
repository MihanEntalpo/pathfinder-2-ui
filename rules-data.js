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

function loadAncestries() {
  ensureRulesData();
  return readStorage(RULES_STORAGE_KEYS.ancestries, []);
}

function loadAncestryFeats() {
  ensureRulesData();
  return readStorage(RULES_STORAGE_KEYS.ancestryFeats, []);
}
