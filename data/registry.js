// Shared baseline registry for per-entity data files.
var PF2_CHARACTER_DATA = (globalThis.PF2_CHARACTER_DATA = globalThis.PF2_CHARACTER_DATA || {});
PF2_CHARACTER_DATA.ancestries = [];
PF2_CHARACTER_DATA.ancestryFeats = [];
PF2_CHARACTER_DATA.classes = [];
PF2_CHARACTER_DATA.backgrounds = [];
PF2_CHARACTER_DATA.archetypes = [];
PF2_CHARACTER_DATA.classFeats = [];

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

function add_class_feat(item) {
  pushUnique(PF2_CHARACTER_DATA.classFeats, item);
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
globalThis.add_class_feat = add_class_feat;
globalThis.addClassFeat = add_class_feat;
