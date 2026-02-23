#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const knowledgeDir = path.join(rootDir, "knowledge");
const dataDir = path.join(rootDir, "data");

const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const ABILITY_FROM_WORD = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

const CLASS_ID_TO_NAME = {
  alchemist: "Alchemist",
  animist: "Animist",
  barbarian: "Barbarian",
  bard: "Bard",
  champion: "Champion",
  cleric: "Cleric",
  druid: "Druid",
  fighter: "Fighter",
  gunslinger: "Gunslinger",
  inventor: "Inventor",
  investigator: "Investigator",
  kineticist: "Kineticist",
  magus: "Magus",
  monk: "Monk",
  oracle: "Oracle",
  psychic: "Psychic",
  ranger: "Ranger",
  rogue: "Rogue",
  sorcerer: "Sorcerer",
  summoner: "Summoner",
  swashbuckler: "Swashbuckler",
  thaumaturge: "Thaumaturge",
  witch: "Witch",
  wizard: "Wizard",
};

const BACKGROUND_ID_TO_NAME = {
  acolyte: "Acolyte",
  artisan: "Artisan",
  "bounty-hunter": "Bounty Hunter",
  criminal: "Criminal",
  detective: "Detective",
  "field-medic": "Field Medic",
  gladiator: "Gladiator",
  noble: "Noble",
  scholar: "Scholar",
  warrior: "Warrior",
};

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function mdToText(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAbilityCodes(text) {
  const found = [];
  const re = /\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\b/gi;
  let m;
  while ((m = re.exec(String(text || "")))) {
    const code = ABILITY_FROM_WORD[m[1].toLowerCase()];
    if (code && !found.includes(code)) found.push(code);
  }
  return found;
}

function parseEntityObjectFile(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  const open = src.indexOf("{");
  const close = src.lastIndexOf("}");
  if (open < 0 || close < 0 || close <= open) return null;
  try {
    return JSON.parse(src.slice(open, close + 1));
  } catch {
    return null;
  }
}

function readCurrentNames(category) {
  const dir = path.join(dataDir, category, "entities");
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith(".js")) continue;
    const item = parseEntityObjectFile(path.join(dir, fileName));
    if (item && item.id && item.name) out[item.id] = item.name;
  }
  return out;
}

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeCategory(category, addFn, items, fileNameFactory) {
  const categoryDir = path.join(dataDir, category);
  const entitiesDir = path.join(categoryDir, "entities");
  ensureCleanDir(entitiesDir);

  const files = [];
  for (const item of items) {
    const base = fileNameFactory(item);
    const fileName = `${base}.js`;
    const filePath = path.join(entitiesDir, fileName);
    const body = JSON.stringify(item, null, 2);
    fs.writeFileSync(filePath, `${addFn}(\n${body}\n);\n`, "utf8");
    files.push(fileName);
  }

  const loadAll = `// Auto-generated loader for ${category}
(() => {
  const files = ${JSON.stringify(files, null, 2)};
  for (const file of files) {
    document.write('<script src="data/${category}/entities/' + file + '"><\\/script>');
  }
})();
`;
  fs.writeFileSync(path.join(categoryDir, "load-all.js"), loadAll, "utf8");
}

function collectClassMeta() {
  const dir = path.join(knowledgeDir, "Class");
  const byName = {};
  const files = fs.readdirSync(dir).filter((f) => /^Classes\.aspx-ID=\d+\.md$/.test(f));
  for (const fileName of files) {
    const src = fs.readFileSync(path.join(dir, fileName), "utf8");
    const nameMatch = src.match(/^# (.+?) - Classes -/m);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    const keyMatch = src.match(/^Key Attribute:\s*(.+)$/m);
    const keyText = keyMatch ? keyMatch[1].trim() : "";
    let keyOptions = extractAbilityCodes(keyText);
    if (/OTHER/i.test(keyText)) {
      for (const code of ABILITIES) {
        if (!keyOptions.includes(code)) keyOptions.push(code);
      }
    }
    if (!keyOptions.length) keyOptions = ABILITIES.slice();

    const startMatch = src.match(/At (\d+)(?:st|nd|rd|th) level and every even-numbered level, you gain a \[[^\]]+ class feat\]/i);
    const classFeatStartLevel = startMatch ? Number(startMatch[1]) : 2;
    byName[normalizeName(name)] = { keyText, keyOptions, classFeatStartLevel };
  }
  return byName;
}

function collectBackgroundMeta() {
  const dir = path.join(knowledgeDir, "Background");
  const byName = {};
  const files = fs.readdirSync(dir).filter((f) => /^Backgrounds\.aspx-ID=\d+\.md$/.test(f));
  for (const fileName of files) {
    const src = fs.readFileSync(path.join(dir, fileName), "utf8");
    const nameMatch = src.match(/^# (.+?) - Backgrounds -/m);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const boostMatch = src.match(/Choose two attribute boosts\.\s*One must be to ([^.]+?), and (?:one is|the other is) a free attribute boost\./i);
    const boostOptions = boostMatch ? extractAbilityCodes(boostMatch[1]) : [];

    const featMatch = src.match(/You gain the (.+?) skill feat/i);
    const grantedFeatName = featMatch ? mdToText(featMatch[1]).replace(/\s*—.*$/, "").trim() : "";

    byName[normalizeName(name)] = { boostOptions, grantedFeatName };
  }
  return byName;
}

function collectClassFeats(classNameToId) {
  const dir = path.join(knowledgeDir, "Feat");
  const files = fs.readdirSync(dir).filter((f) => /^Feats\.aspx-ID=\d+\.md$/.test(f));
  const feats = [];
  for (const fileName of files) {
    const src = fs.readFileSync(path.join(dir, fileName), "utf8");
    if (/^# \[All Archetypes\]/m.test(src)) continue;
    const idMatch = fileName.match(/ID=(\d+)\.md$/);
    const titleMatch = src.match(/^# (.+?) - Feats -/m);
    if (!idMatch || !titleMatch) continue;
    const featIdNum = idMatch[1];
    const name = mdToText(titleMatch[1]);

    const levelMatch = src.match(/(?:^|\n)# .*?\bFeat (\d+)\b/m);
    if (!levelMatch) continue;
    const level = Number(levelMatch[1]);

    const lines = src.split("\n");
    const featHeadingIdx = lines.findIndex((line) => /^# .*?\bFeat \d+\b/.test(line));
    if (featHeadingIdx < 0) continue;
    const sourceIdx = lines.findIndex((line, idx) => idx > featHeadingIdx && /^Source\s+/.test(line));
    if (sourceIdx < 0) continue;
    const traitChunk = lines.slice(featHeadingIdx + 1, sourceIdx).join(" ");
    if (/Archetype/i.test(traitChunk)) continue;

    let className = null;
    const explicitClass = src.match(/^Class \[([^\]]+)\]\(\.\.\/Class\/Classes\.aspx-ID=\d+.*\)$/m);
    if (explicitClass) className = explicitClass[1].trim();

    if (!className) {
      const re = /\[([^\]]+)\]\(\.\.\/Trait\/Traits\.aspx-ID=\d+[^)]*\)/g;
      let m;
      while ((m = re.exec(traitChunk))) {
        if (classNameToId[m[1]]) {
          className = m[1];
          break;
        }
      }
    }

    const classId = className ? classNameToId[className] : null;
    if (!classId) continue;

    const delimiterIdx = lines.findIndex((line, idx) => idx > sourceIdx && line.trim() === "---");
    let description = "";
    if (delimiterIdx >= 0) {
      const collected = [];
      for (let i = delimiterIdx + 1; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line) {
          if (collected.length) break;
          continue;
        }
        if (line.startsWith("## ")) break;
        collected.push(line);
      }
      description = mdToText(collected.join(" "));
    }

    const sourceLine = lines[sourceIdx].replace(/^Source\s+/, "").trim();

    feats.push({
      id: `class-feat-${featIdNum}`,
      classId,
      name,
      level,
      description,
      source: mdToText(sourceLine),
    });
  }
  return feats.sort((a, b) => a.classId.localeCompare(b.classId) || a.level - b.level || a.name.localeCompare(b.name));
}

function main() {
  const classNamesRu = readCurrentNames("classes");
  const bgNamesRu = readCurrentNames("backgrounds");

  const classMetaByName = collectClassMeta();
  const bgMetaByName = collectBackgroundMeta();

  const classNameToId = {};
  for (const [id, className] of Object.entries(CLASS_ID_TO_NAME)) classNameToId[className] = id;

  const classes = Object.entries(CLASS_ID_TO_NAME).map(([id, className]) => {
    const meta = classMetaByName[normalizeName(className)] || {};
    return {
      id,
      name: classNamesRu[id] || className,
      keyAttributeOptions: Array.isArray(meta.keyOptions) && meta.keyOptions.length ? meta.keyOptions : ABILITIES.slice(),
      keyAttributeText: meta.keyText || "",
      classFeatStartLevel: Number(meta.classFeatStartLevel) || 2,
    };
  });

  const backgrounds = Object.entries(BACKGROUND_ID_TO_NAME).map(([id, bgName]) => {
    const meta = bgMetaByName[normalizeName(bgName)] || {};
    return {
      id,
      name: bgNamesRu[id] || bgName,
      boostOptions: Array.isArray(meta.boostOptions) && meta.boostOptions.length ? meta.boostOptions : ABILITIES.slice(),
      freeBoostCount: 1,
      grantedFeatName: meta.grantedFeatName || "",
    };
  });

  const classFeats = collectClassFeats(classNameToId);

  writeCategory("classes", "add_class", classes, (item) => item.id);
  writeCategory("backgrounds", "add_background", backgrounds, (item) => item.id);
  writeCategory("class-feats", "add_class_feat", classFeats, (item) => `${item.classId}-${item.id}`);

  console.log(`Built from knowledge: classes=${classes.length}, backgrounds=${backgrounds.length}, classFeats=${classFeats.length}`);
}

main();
