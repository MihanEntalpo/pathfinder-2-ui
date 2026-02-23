#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ANCESTRIES_DIR = path.join(ROOT_DIR, 'data', 'pf2_ru', 'snapshots', 'ancestries');
const OUTPUT_FILE = path.join(ROOT_DIR, 'data', 'pf2-defaults.js');

function decodeHtml(input) {
  if (!input) return '';
  return String(input)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)));
}

function stripTags(input) {
  return String(input)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
}

function normalizeSpace(input) {
  return decodeHtml(input)
    .replace(/\u00A0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function cleanHtmlText(input) {
  return normalizeSpace(stripTags(input));
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function parseSectionMap(paramsSection) {
  const map = new Map();
  const re = /<h2 class="h2-header">([^<]+)<\/h2>\s*([\s\S]*?)(?=<h2 class="h2-header">|$)/g;
  let m;
  while ((m = re.exec(paramsSection)) !== null) {
    const key = normalizeSpace(m[1]).toLowerCase();
    const value = cleanHtmlText(m[2]);
    if (key && value) map.set(key, value);
  }
  return map;
}

function findSectionByTitle(map, variants) {
  for (const name of variants) {
    const value = map.get(name.toLowerCase());
    if (value) return value;
  }
  return '';
}

function parseAbilityList(rawValue, includeFree = true) {
  if (!rawValue) return [];
  const value = rawValue.toLowerCase();
  const out = [];

  const freeCount = value.includes('дв') && value.includes('универсал') ? 2 : (value.includes('универсал') ? 1 : 0);
  if (includeFree) {
    for (let i = 0; i < freeCount; i += 1) out.push('Свободный');
  }

  const matchers = [
    ['сила', 'STR'],
    ['ловк', 'DEX'],
    ['телослож', 'CON'],
    ['интеллект', 'INT'],
    ['мудр', 'WIS'],
    ['харизм', 'CHA'],
  ];

  for (const [needle, stat] of matchers) {
    if (value.includes(needle)) out.push(stat);
  }

  if (out.length > 0) return uniq(out);

  return uniq(
    rawValue
      .split(/\n|,|;/g)
      .map((v) => v.trim())
      .filter(Boolean)
  );
}

function parseLanguages(rawValue) {
  if (!rawValue) return [];
  const out = [];
  for (const chunk of rawValue.split(/\n|,/g)) {
    let value = chunk.trim().replace(/\.$/, '');
    let lower = value.toLowerCase();
    if (!value) continue;

    if (lower.includes('дополнительн')) {
      out.push('Дополнительные по Интеллекту');
      continue;
    }

    if (
      lower.includes('выбираем') ||
      lower.includes('равном') ||
      lower.includes('котор') ||
      lower.includes('доступ') ||
      lower.includes('мастера') ||
      lower.includes('вместо')
    ) {
      continue;
    }

    if (value.includes(':')) {
      value = value.split(':').pop().trim();
      lower = value.toLowerCase();
    }

    if (lower.startsWith('языки ')) {
      value = `Языки ${value.slice(6).trim()}`;
      lower = value.toLowerCase();
    }

    if (!/^[А-ЯЁ]/u.test(value)) continue;

    if (value.length > 40 && !/^[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+){0,2}$/u.test(value)) {
      continue;
    }

    out.push(value);
  }
  return uniq(out);
}

function extractTraits(paramsSection) {
  const traitsBlockMatch = paramsSection.match(/<div class="item-traits"[^>]*>([\s\S]*?)<\/div>/);
  if (!traitsBlockMatch) return [];
  const anchors = [...traitsBlockMatch[1].matchAll(/<a[^>]*>([\s\S]*?)<\/a>/g)].map((m) => cleanHtmlText(m[1]));
  return uniq(anchors);
}

function pickAncestryTrait(allTraits, ancestryName) {
  if (!allTraits.length) return ancestryName;
  const lowerName = ancestryName.toLowerCase();
  const exact = allTraits.find((trait) => trait.toLowerCase() === lowerName);
  if (exact) return exact;
  const containsName = allTraits.find((trait) => trait.toLowerCase().includes(lowerName));
  if (containsName) return containsName;
  const rarity = new Set(['редкий', 'необычный', 'обычный', 'rare', 'uncommon', 'common']);
  const nonRarity = allTraits.find((trait) => !rarity.has(trait.toLowerCase()));
  return nonRarity || allTraits[0];
}

function extractFirstHeritage(html) {
  const tabStart = html.indexOf('<div class="tab-content" id="heritages">');
  if (tabStart < 0) return '';
  const tabEnd = html.indexOf('<div class="tab-content" id="feats">', tabStart);
  const tab = tabEnd > tabStart ? html.slice(tabStart, tabEnd) : html.slice(tabStart);
  const anchorMatches = [...tab.matchAll(/<a class="content-header"[^>]*>([\s\S]*?)<\/a>/g)];
  for (const m of anchorMatches) {
    const text = cleanHtmlText(m[1]);
    if (text) return text;
  }
  return '';
}

function extractAncestryName(html, slug) {
  const menuRe = new RegExp(`id="h3-ancestry-${slug}"[\\s\\S]*?<a[^>]*>\\s*([^<]+)\\s*<\\/a>`);
  const menuMatch = html.match(menuRe);
  if (menuMatch) {
    const name = normalizeSpace(menuMatch[1]);
    if (name) return name;
  }

  const headerMatch = html.match(/<h1 class="h1-header">Параметры\s+([^<]+)<\/h1>/i);
  if (headerMatch) {
    const name = normalizeSpace(headerMatch[1]).replace(/^\s*([А-ЯЁA-Z][^\s]+)\s*$/u, '$1');
    if (name) return name;
  }

  return slug;
}

function extractBestItemsArray(html) {
  const candidates = [];
  const re = /items='(\[[\s\S]*?\])'\s*(?:\/>|>|\n)/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed) && parsed.length > 0) candidates.push(parsed);
    } catch {
      // ignore non-JSON matches
    }
  }

  if (candidates.length === 0) return [];

  candidates.sort((a, b) => b.length - a.length);
  return candidates[0];
}

function toInt(value, fallback) {
  const match = String(value || '').match(/-?\d+/);
  if (!match) return fallback;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeId(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function build() {
  if (!fs.existsSync(ANCESTRIES_DIR)) {
    throw new Error(`Directory not found: ${ANCESTRIES_DIR}. Run scripts/download_pf2_rules.sh first.`);
  }

  const files = fs
    .readdirSync(ANCESTRIES_DIR)
    .filter((name) => name.endsWith('.html') && name !== 'index.html')
    .sort();

  const ancestries = [];
  const feats = [];

  for (const file of files) {
    const slug = path.basename(file, '.html');
    const html = fs.readFileSync(path.join(ANCESTRIES_DIR, file), 'utf8');

    const detailsStart = html.indexOf('<div class="tab-content" id="details">');
    if (detailsStart < 0) continue;
    const detailsEnd = html.indexOf('<div class="tab-content" id="heritages">', detailsStart);
    const paramsSection = detailsEnd > detailsStart ? html.slice(detailsStart, detailsEnd) : html.slice(detailsStart);

    const sectionMap = parseSectionMap(paramsSection);

    const hpRaw = findSectionByTitle(sectionMap, ['Пункты здоровья', 'Хиты']);
    const sizeRaw = findSectionByTitle(sectionMap, ['Размер']);
    const speedRaw = findSectionByTitle(sectionMap, ['Скорость']);
    const boostsRaw = findSectionByTitle(sectionMap, ['Повышения Характеристик']);
    const flawsRaw = findSectionByTitle(sectionMap, ['Изъяны Характеристик', 'Недостатки Характеристик']);
    const languagesRaw = findSectionByTitle(sectionMap, ['Языки']);

    const ancestryName = extractAncestryName(html, slug);
    const traits = extractTraits(paramsSection);

    ancestries.push({
      id: slug,
      name: ancestryName,
      hp: toInt(hpRaw, 6),
      size: sizeRaw || 'Средний',
      speed: toInt(speedRaw, 25),
      boosts: parseAbilityList(boostsRaw, true),
      flaws: parseAbilityList(flawsRaw, false),
      languages: parseLanguages(languagesRaw),
      trait: pickAncestryTrait(traits, ancestryName),
      heritage: extractFirstHeritage(html) || '',
    });

    const ancestryFeats = extractBestItemsArray(html);
    for (const feat of ancestryFeats) {
      const featId = sanitizeId(`${slug}-${feat.id ?? feat.name ?? Math.random().toString(36).slice(2, 8)}`);
      const prereq = cleanHtmlText(feat.prerequisites || '');
      const source = cleanHtmlText(feat.source || '');
      const descriptionParts = [];
      if (source) descriptionParts.push(`Источник: ${source}`);
      if (prereq && prereq !== '-') descriptionParts.push(`Требования: ${prereq}`);

      feats.push({
        id: featId,
        ancestryId: slug,
        name: normalizeSpace(feat.rus_name || feat.name || String(feat.id || featId)),
        level: Number(feat.level_sort || feat.level || 1),
        description: descriptionParts.join('. '),
      });
    }
  }

  ancestries.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  feats.sort((a, b) => a.ancestryId.localeCompare(b.ancestryId, 'ru') || a.level - b.level || a.name.localeCompare(b.name, 'ru'));

  const output = [
    '// Auto-generated by scripts/generate_pf2_defaults.js',
    `// Source snapshot: ${path.relative(ROOT_DIR, ANCESTRIES_DIR)}`,
    'globalThis.PF2_DEFAULT_ANCESTRIES = ' + JSON.stringify(ancestries, null, 2) + ';',
    '',
    'globalThis.PF2_DEFAULT_ANCESTRY_FEATS = ' + JSON.stringify(feats, null, 2) + ';',
    '',
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

  console.log(`Generated ${path.relative(ROOT_DIR, OUTPUT_FILE)}.`);
  console.log(`Ancestries: ${ancestries.length}`);
  console.log(`Ancestry feats: ${feats.length}`);
}

build();
