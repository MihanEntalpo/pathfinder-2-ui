const STORAGE_KEYS = {
  characters: "pf2_characters",
  monsters: "pf2_monsters",
  games: "pf2_games",
  ancestries: "pf2_ancestries",
  ancestryFeats: "pf2_ancestry_feats",
  backgrounds: "pf2_backgrounds",
  classFeats: "pf2_class_feats",
};

const PROFICIENCY_RANKS = {
  untrained: 0,
  trained: 2,
  expert: 4,
  master: 6,
  legendary: 8,
};

function proficiencyBonus(rank, level) {
  if (rank === "untrained") return 0;
  return (Number(level) || 0) + (PROFICIENCY_RANKS[rank] ?? 0);
}

function abilityMod(score) {
  return Math.floor(((Number(score) || 10) - 10) / 2);
}

function signed(v) {
  return v >= 0 ? `+${v}` : `${v}`;
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function deriveCharacterStats(c) {
  const mods = {
    str: abilityMod(c.str), dex: abilityMod(c.dex), con: abilityMod(c.con),
    int: abilityMod(c.int), wis: abilityMod(c.wis), cha: abilityMod(c.cha),
  };
  const hp = c.ancestryHp + c.classHp + mods.con + (c.level - 1) * (c.classHp + mods.con);
  const ac = 10 + mods.dex + proficiencyBonus(c.armorProf, c.level) + c.itemBonusAc;
  const perception = proficiencyBonus(c.percProf, c.level) + mods.wis;
  const fort = proficiencyBonus(c.fortProf, c.level) + mods.con;
  const reflex = proficiencyBonus(c.refProf, c.level) + mods.dex;
  const will = proficiencyBonus(c.willProf, c.level) + mods.wis;
  return { mods, hp: Math.max(hp, c.level), ac, perception, fort, reflex, will };
}
