#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/data/pf2_ru"
TMP_DIR="$OUT_DIR/_tmp"
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"

mkdir -p "$TMP_DIR" "$OUT_DIR/snapshots/rules" "$OUT_DIR/snapshots/ancestries"

CHALLENGE_FILE="$TMP_DIR/challenge_rules.html"

echo "[1/5] Loading anti-bot challenge..."
curl -A "$UA" -L --fail --silent --show-error "https://pf2.ru/rules" -o "$CHALLENGE_FILE"

echo "[2/5] Solving PoW challenge..."
COOKIE_TOKEN="$(node - "$CHALLENGE_FILE" <<'NODE'
const fs = require('fs');
const crypto = require('crypto');

const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8');
const challengeMatch = html.match(/const got\s*=\s*({[\s\S]*?});/);
if (!challengeMatch) {
  process.exit(2);
}

const challenge = Function(`"use strict";return (${challengeMatch[1]});`)();

function leadingZeroBits(buf) {
  let bits = 0;
  for (const byte of buf) {
    for (let i = 7; i >= 0; i -= 1) {
      if ((byte >> i) & 1) return bits;
      bits += 1;
    }
  }
  return bits;
}

const seed = Buffer.from(challenge.seed, 'hex');
let nonceHex = '';
for (;;) {
  const nonce = crypto.randomBytes(seed.length);
  const digest = crypto.createHash('sha512').update(Buffer.concat([seed, nonce])).digest();
  if (leadingZeroBits(digest) >= Number(challenge.complexity || 16)) {
    nonceHex = nonce.toString('hex');
    break;
  }
}

process.stdout.write(`${challenge.seed}:${nonceHex}:${challenge.mac}:`);
NODE
)"

if [[ -z "$COOKIE_TOKEN" ]]; then
  echo "Failed to generate PoW cookie" >&2
  exit 1
fi

fetch_with_cookie() {
  local url="$1"
  local output="$2"
  mkdir -p "$(dirname "$output")"
  curl -A "$UA" -L --fail --silent --show-error \
    -H "Cookie: __solution=$COOKIE_TOKEN" \
    "$url" -o "$output"
}

to_path() {
  local url="$1"
  local rel="${url#https://pf2.ru/}"
  rel="${rel%%\?*}"
  rel="${rel%%#*}"
  if [[ -z "$rel" ]]; then
    rel="index"
  fi
  if [[ "$rel" == "rules" ]]; then
    rel="rules/index"
  fi
  if [[ "$rel" == */ ]]; then
    rel="${rel}index"
  fi
  printf '%s' "$rel"
}

echo "[3/5] Downloading rules table of contents..."
RULES_INDEX="$OUT_DIR/snapshots/rules/index.html"
fetch_with_cookie "https://pf2.ru/rules" "$RULES_INDEX"

node - "$RULES_INDEX" <<'NODE' > "$TMP_DIR/rules_links.txt"
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const links = new Set(['https://pf2.ru/rules']);
for (const m of html.matchAll(/href="(https:\/\/pf2\.ru\/rules[^"#?]*)/g)) {
  links.add(m[1]);
}
for (const url of [...links].sort()) {
  console.log(url);
}
NODE

rules_count="$(wc -l < "$TMP_DIR/rules_links.txt" | tr -d ' ')"
echo "    Rules links found: $rules_count"

while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  rel_path="$(to_path "$url")"
  output="$OUT_DIR/snapshots/${rel_path}.html"
  echo "    - $url"
  fetch_with_cookie "$url" "$output"
done < "$TMP_DIR/rules_links.txt"

echo "[4/5] Downloading ancestries index + details pages..."
ANCESTRIES_INDEX="$OUT_DIR/snapshots/ancestries/index.html"
fetch_with_cookie "https://pf2.ru/ancestries" "$ANCESTRIES_INDEX"

node - "$ANCESTRIES_INDEX" <<'NODE' > "$TMP_DIR/ancestry_links.txt"
const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const links = new Set();
for (const m of html.matchAll(/https:\/\/pf2\.ru\/ancestries\/([a-z-]+)\?tab=details/g)) {
  links.add(`https://pf2.ru/ancestries/${m[1]}?tab=details`);
}
for (const url of [...links].sort()) {
  console.log(url);
}
NODE

ancestry_count="$(wc -l < "$TMP_DIR/ancestry_links.txt" | tr -d ' ')"
echo "    Ancestry detail pages found: $ancestry_count"

while IFS= read -r url; do
  [[ -z "$url" ]] && continue
  slug="$(echo "$url" | sed -E 's#https://pf2.ru/ancestries/([a-z-]+)\?tab=details#\1#')"
  output="$OUT_DIR/snapshots/ancestries/${slug}.html"
  echo "    - $url"
  fetch_with_cookie "$url" "$output"
done < "$TMP_DIR/ancestry_links.txt"

echo "[5/5] Writing manifest..."
node - "$OUT_DIR" <<'NODE'
const fs = require('fs');
const path = require('path');

const outDir = process.argv[2];
const rulesDir = path.join(outDir, 'snapshots', 'rules');
const ancestriesDir = path.join(outDir, 'snapshots', 'ancestries');

function collect(dir) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push(full);
    }
  }
  walk(dir);
  return files;
}

const manifest = {
  generatedAt: new Date().toISOString(),
  source: 'https://pf2.ru/rules',
  files: {
    rules: collect(rulesDir).length,
    ancestries: collect(ancestriesDir).length,
  },
};

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
NODE

echo "Done. Snapshot saved in data/pf2_ru/snapshots"
