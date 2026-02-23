#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(ROOT, 'docs', 'aonprd');
const OUT_ROOT = path.join(ROOT, 'knowledge');

if (!fs.existsSync(SOURCE_ROOT)) {
  console.error(`Source folder not found: ${SOURCE_ROOT}`);
  process.exit(1);
}

const GROUP_ALIASES = {
  actions: 'Action',
  activities: 'Action',
  afflictions: 'Affliction',
  ancestries: 'Ancestry',
  archetypes: 'Archetypes',
  apparitions: 'Apparition',
  articles: 'Article',
  backgrounds: 'Background',
  bloodlines: 'Bloodline',
  classes: 'Class',
  classsamples: 'ClassSample',
  conditions: 'Condition',
  contactus: 'Contact',
  contributors: 'Contributor',
  creatures: 'Creature',
  curses: 'Curses',
  deities: 'Deity',
  domains: 'Domain',
  equipment: 'Equipment',
  epithet: 'Epithet',
  epithets: 'Epithet',
  familiars: 'Familiar',
  feats: 'Feat',
  hazards: 'Hazard',
  heritages: 'Heritage',
  hunteredge: 'HunterEdge',
  instincts: 'Instinct',
  itemcurses: 'ItemCurse',
  languages: 'Language',
  lessons: 'Lesson',
  licenses: 'License',
  monsterabilities: 'MonsterAbility',
  monsterfamilies: 'MonsterFamily',
  monsters: 'Monster',
  mythiccallings: 'MythicCalling',
  mythicdestinies: 'MythicDestiny',
  mythicfeats: 'MythicFeat',
  mythicrituals: 'MythicRitual',
  mythicspells: 'MythicSpell',
  npcs: 'NPC',
  planes: 'Plane',
  relics: 'Relic',
  rituals: 'Ritual',
  rules: 'Rules',
  setting: 'Setting',
  shields: 'Shield',
  skills: 'Skill',
  sources: 'Source',
  spells: 'Spell',
  support: 'Support',
  traits: 'Trait',
  vehicles: 'Vehicle',
  weapons: 'Weapon',
};

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function sanitizeGroup(value) {
  return value.replace(/[^A-Za-z0-9_-]+/g, '_') || 'Misc';
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function stripTags(text) {
  return decodeEntities(String(text || '').replace(/<[^>]*>/g, ''));
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return '';
  return stripTags(m[1]).replace(/\s+/g, ' ').trim();
}

function extractMainHtml(html) {
  const mainMatch = html.match(/<div class="main" id="main">([\s\S]*?)<\/div>\s*<div class="clear">/i);
  if (mainMatch) return mainMatch[1];

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : html;
}

function groupFromRel(relPath) {
  const base = path.posix.basename(relPath);
  const m = base.match(/^([^.]+)\.aspx/i);
  const raw = m ? m[1] : base.replace(/\.[^.]+$/, '');
  const normalized = raw.toLowerCase();
  return sanitizeGroup(GROUP_ALIASES[normalized] || raw || 'Misc');
}

function normalizeLocalHref(rawHref) {
  if (!rawHref) return null;
  let href = decodeEntities(rawHref.trim());
  if (!href || href.startsWith('#')) return null;
  if (/^(javascript:|mailto:|tel:|data:)/i.test(href)) return null;

  const hashIdx = href.indexOf('#');
  if (hashIdx >= 0) href = href.slice(0, hashIdx);

  const makeFromAscx = (base, query) => {
    if (!base.toLowerCase().endsWith('.aspx')) return null;
    if (!query) return `${base}.htm`;
    return `${base}-${query}.htm`;
  };

  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      if (!/^(?:www\.)?2e\.aonprd\.com$/i.test(url.hostname)) return null;
      const pathname = decodeURIComponent(url.pathname || '/');
      const base = pathname === '/' ? 'index.htm' : pathname.replace(/^\/+/, '');
      if (base === 'index.htm') return base;
      if (/\.aspx$/i.test(base)) return makeFromAscx(base, url.search ? url.search.slice(1) : '');
      return base;
    } catch {
      return null;
    }
  }

  if (href.startsWith('//')) return null;

  const qIdx = href.indexOf('?');
  if (qIdx >= 0) {
    const base = href.slice(0, qIdx);
    const query = href.slice(qIdx + 1);
    const aspxLocal = makeFromAscx(base, query);
    if (aspxLocal) return aspxLocal;
  }

  if (/\.aspx$/i.test(href)) return `${href}.htm`;
  return href;
}

function linkTargetForHref(rawHref, currentRel, relToHtml) {
  const normalized = normalizeLocalHref(rawHref);
  if (!normalized) return null;

  const resolved = toPosix(path.posix.normalize(path.posix.join(path.posix.dirname(currentRel), normalized)));
  const tryKeys = [resolved, path.posix.basename(resolved)];

  for (const key of tryKeys) {
    const rel = relToHtml.get(key.toLowerCase());
    if (rel) return rel;
  }

  return null;
}

function escapeMdText(text) {
  return text.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
}

function toMdHref(href) {
  return encodeURI(href).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

function toMarkdown(contentHtml, fileRel, mdRel, relToHtml, htmlToMd) {
  let html = contentHtml;

  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  html = html.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  html = html.replace(/<img\b[^>]*>/gi, '');

  html = html.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs, inner) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch ? (hrefMatch[1] || hrefMatch[2] || hrefMatch[3] || '') : '';

    const text = stripTags(inner).replace(/\s+/g, ' ').trim() || stripTags(href).trim();
    if (!text) return '';

    const targetHtmlRel = linkTargetForHref(href, fileRel, relToHtml);
    if (targetHtmlRel) {
      const targetMdRel = htmlToMd.get(targetHtmlRel);
      if (targetMdRel) {
        let relLink = toPosix(path.posix.relative(path.posix.dirname(mdRel), targetMdRel));
        if (!relLink || relLink === '') relLink = path.posix.basename(targetMdRel);
        if (!relLink.startsWith('.')) relLink = `./${relLink}`;
        return `[${escapeMdText(text)}](${toMdHref(relLink)})`;
      }
    }

    if (/^https?:\/\//i.test(href)) {
      return `[${escapeMdText(text)}](${toMdHref(href)})`;
    }

    if (/\.(?:png|jpe?g|gif|webp|svg|ico)$/i.test(href) || /\.(?:png|jpe?g|gif|webp|svg|ico)$/i.test(text)) {
      return '';
    }

    return escapeMdText(text);
  });

  for (let i = 6; i >= 1; i -= 1) {
    const re = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
    html = html.replace(re, (_, inner) => `\n\n${'#'.repeat(i)} ${stripTags(inner).replace(/\s+/g, ' ').trim()}\n\n`);
  }

  html = html.replace(/<hr\b[^>]*>/gi, '\n\n---\n\n');
  html = html.replace(/<br\s*\/?\s*>/gi, '\n');
  html = html.replace(/<li\b[^>]*>/gi, '\n- ');
  html = html.replace(/<\/li>/gi, '');
  html = html.replace(/<\/p>/gi, '\n\n');
  html = html.replace(/<p\b[^>]*>/gi, '');
  html = html.replace(/<\/div>/gi, '\n');
  html = html.replace(/<div\b[^>]*>/gi, '\n');
  html = html.replace(/<\/tr>/gi, '\n');
  html = html.replace(/<tr\b[^>]*>/gi, '\n');
  html = html.replace(/<t[dh]\b[^>]*>/gi, ' | ');
  html = html.replace(/<\/(?:t[dh]|table|tbody|thead|ul|ol|section|article|header|footer|aside|blockquote)>/gi, '\n');
  html = html.replace(/<(?:table|tbody|thead|ul|ol|section|article|header|footer|aside|blockquote)\b[^>]*>/gi, '\n');
  html = html.replace(/<[^>]+>/g, '');

  let text = decodeEntities(html)
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!text) text = '(No extracted text content)';

  return text + '\n';
}

function collectHtmlFiles(dir) {
  const out = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.html?$/i.test(entry.name) || /\.htm$/i.test(entry.name)) {
        out.push(full);
      }
    }
  }
  walk(dir);
  return out;
}

const htmlFiles = collectHtmlFiles(SOURCE_ROOT).sort((a, b) => a.localeCompare(b));
if (htmlFiles.length === 0) {
  console.error('No HTML files found in docs/aonprd');
  process.exit(1);
}

const relToHtml = new Map();
const htmlToMd = new Map();

for (const abs of htmlFiles) {
  const rel = toPosix(path.relative(SOURCE_ROOT, abs));
  relToHtml.set(rel.toLowerCase(), rel);
}

for (const abs of htmlFiles) {
  const rel = toPosix(path.relative(SOURCE_ROOT, abs));
  const base = path.posix.basename(rel).replace(/\.html?$/i, '.md').replace(/\.htm$/i, '.md');
  const group = groupFromRel(rel);
  const mdRel = toPosix(path.posix.join(group, base));
  htmlToMd.set(rel, mdRel);
}

fs.rmSync(OUT_ROOT, { recursive: true, force: true });
fs.mkdirSync(OUT_ROOT, { recursive: true });

let converted = 0;

for (const abs of htmlFiles) {
  const rel = toPosix(path.relative(SOURCE_ROOT, abs));
  const mdRel = htmlToMd.get(rel);
  const outPath = path.join(OUT_ROOT, mdRel);

  const html = fs.readFileSync(abs, 'utf8');
  const title = extractTitle(html);
  const mainHtml = extractMainHtml(html);
  const mdBody = toMarkdown(mainHtml, rel, mdRel, relToHtml, htmlToMd);

  const md = [
    `# ${title || path.posix.basename(rel)}`,
    '',
    `Source HTML: \`${toPosix(path.posix.join('docs/aonprd', rel))}\``,
    '',
    mdBody,
  ].join('\n');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, 'utf8');

  converted += 1;
  if (converted % 500 === 0) {
    console.log(`Converted ${converted}/${htmlFiles.length}`);
  }
}

const groupStats = new Map();
for (const mdRel of htmlToMd.values()) {
  const group = mdRel.split('/')[0];
  groupStats.set(group, (groupStats.get(group) || 0) + 1);
}

const summary = {
  generatedAt: new Date().toISOString(),
  sourceRoot: 'docs/aonprd',
  outputRoot: 'knowledge',
  htmlFiles: htmlFiles.length,
  markdownFiles: converted,
  groups: Object.fromEntries([...groupStats.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
};

fs.writeFileSync(path.join(OUT_ROOT, '_SUMMARY.json'), JSON.stringify(summary, null, 2) + '\n', 'utf8');
console.log(`Done: ${converted} files converted.`);
