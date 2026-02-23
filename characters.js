const characterForm = byId("characterForm");
const characterList = byId("characterList");
const preview = byId("preview");

const ancestrySelect = byId("ancestry");
const classSelect = byId("classId");
const backgroundSelect = byId("backgroundId");

const ancestryFeatList = byId("ancestryFeatList");
const classFeatList = byId("classFeatList");

const ancestryFeatLimitHint = byId("featLimitHint");
const classFeatLimitHint = byId("classFeatLimitHint");
const backgroundFeatSummary = byId("backgroundFeatSummary");
const attributeBoostSummary = byId("attributeBoostSummary");

const backgroundBoostPrimary = byId("backgroundBoostPrimary");
const backgroundBoostFree = byId("backgroundBoostFree");
const classKeyBoost = byId("classKeyBoost");

const ABILITY_IDS = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_CODE_BY_ID = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};
const ABILITY_ID_BY_CODE = {
  STR: "str",
  DEX: "dex",
  CON: "con",
  INT: "int",
  WIS: "wis",
  CHA: "cha",
};

function toAbilityLabel(code) {
  return String(code || "").toUpperCase();
}

function setSelectOptions(selectEl, options, preferred) {
  const html = options.map((opt) => `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`).join("");
  selectEl.innerHTML = html;
  if (preferred && options.some((opt) => opt.value === preferred)) {
    selectEl.value = preferred;
  } else if (options.length) {
    selectEl.value = options[0].value;
  }
}

function featSlotsForLevel(level) {
  const base = 1;
  const bonusLevels = [5, 9, 13, 17];
  return base + bonusLevels.filter((lvl) => level >= lvl).length;
}

function classFeatSlotsForLevel(level, startLevel) {
  let slots = 0;
  if (startLevel <= 1 && level >= 1) slots += 1;
  for (let lvl = 2; lvl <= level; lvl += 2) {
    if (lvl >= startLevel) slots += 1;
  }
  return slots;
}

function getSelectedClass() {
  return loadCharacterClasses().find((item) => item.id === classSelect.value) || null;
}

function getSelectedBackground() {
  return loadCharacterBackgrounds().find((item) => item.id === backgroundSelect.value) || null;
}

function getCheckedAncestryFeatIds() {
  return Array.from(document.querySelectorAll("input[name='ancestryFeat']:checked")).map((el) => el.value);
}

function getCheckedClassFeatIds() {
  return Array.from(document.querySelectorAll("input[name='classFeat']:checked")).map((el) => el.value);
}

function getSelectedBoostCodes() {
  return [
    backgroundBoostPrimary.value,
    backgroundBoostFree.value,
    classKeyBoost.value,
  ].filter((code) => Boolean(ABILITY_ID_BY_CODE[String(code).toUpperCase()]));
}

function computeAbilityBonuses() {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  for (const code of getSelectedBoostCodes()) {
    const abilityId = ABILITY_ID_BY_CODE[String(code).toUpperCase()];
    if (abilityId) bonuses[abilityId] += 2;
  }
  return bonuses;
}

function getClassLabel(character) {
  if (character.className) return character.className;
  const cls = loadCharacterClasses().find((item) => item.id === character.classId);
  return cls ? cls.name : "—";
}

function getBackgroundLabel(character) {
  if (character.background) return character.background;
  const bg = loadCharacterBackgrounds().find((item) => item.id === character.backgroundId);
  return bg ? bg.name : "—";
}

function formatBoostSummary(selection) {
  if (!selection) return "—";
  const parts = [
    selection.backgroundPrimary,
    selection.backgroundFree,
    selection.classKey,
  ].filter(Boolean).map(toAbilityLabel);
  return parts.length ? parts.join(", ") : "—";
}

function renderPreview() {
  const c = getCharacterFormData();
  const s = deriveCharacterStats(c);
  const boostsText = formatBoostSummary(c.selectedAttributeBoosts);
  preview.innerHTML = `
    <p><span class="badge">Lvl ${c.level}</span> <span class="badge">${escapeHtml(c.className)} · ${escapeHtml(c.background || "Без background")}</span></p>
    <p><span class="badge">${escapeHtml(c.ancestry)}</span> <span class="badge">Boosts: ${escapeHtml(boostsText)}</span></p>
    <p>HP: <span class="stat">${s.hp}</span> | AC: <span class="stat">${s.ac}</span> | Perception: <span class="stat">${signed(s.perception)}</span></p>
    <p>Fort ${signed(s.fort)} | Ref ${signed(s.reflex)} | Will ${signed(s.will)}</p>
    <p>STR ${signed(s.mods.str)} DEX ${signed(s.mods.dex)} CON ${signed(s.mods.con)} INT ${signed(s.mods.int)} WIS ${signed(s.mods.wis)} CHA ${signed(s.mods.cha)}</p>
    <p>Ancestry Feats: ${c.selectedFeatIds.length} | Class Feats: ${c.selectedClassFeatIds.length}</p>
  `;
}

function renderAncestryOptions() {
  const ancestries = loadAncestries();
  ancestrySelect.innerHTML = ancestries.map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`).join("");
}

function renderClassOptions(preferred) {
  const classes = loadCharacterClasses();
  setSelectOptions(
    classSelect,
    classes.map((item) => ({ value: item.id, label: item.name })),
    preferred
  );
}

function renderBackgroundOptions(preferred) {
  const backgrounds = loadCharacterBackgrounds();
  setSelectOptions(
    backgroundSelect,
    backgrounds.map((item) => ({ value: item.id, label: item.name })),
    preferred
  );
}

function renderArchetypeOptions() {
  const archetypeList = byId("archetypeOptions");
  const archetypes = loadCharacterArchetypes();
  archetypeList.innerHTML = archetypes.map((item) => `<option value="${escapeHtml(item.name)}"></option>`).join("");
}

function applyAncestryData(ancestryId) {
  const ancestry = loadAncestries().find((a) => a.id === ancestryId);
  if (!ancestry) return;
  byId("ancestryHp").value = ancestry.hp;
  byId("ancestrySize").value = ancestry.size;
  byId("ancestrySpeed").value = ancestry.speed;
  byId("ancestryBoosts").value = ancestry.boosts.join(", ");
  byId("ancestryFlaws").value = ancestry.flaws.join(", ") || "—";
  byId("ancestryLanguages").value = ancestry.languages.join(", ");
  byId("ancestryTrait").value = ancestry.trait;
  byId("ancestryHeritage").value = ancestry.heritage;
}

function renderAncestryFeats(selectedIds = []) {
  const ancestryId = ancestrySelect.value;
  const level = Number(byId("level").value) || 1;
  const featLimit = featSlotsForLevel(level);
  const feats = loadAncestryFeats().filter((f) => f.ancestryId === ancestryId && f.level <= level);
  const allowedIds = selectedIds
    .filter((id) => feats.some((feat) => feat.id === id))
    .slice(0, featLimit);

  ancestryFeatLimitHint.textContent = `На уровне ${level} можно выбрать ${featLimit} черт(ы) происхождения.`;

  if (!feats.length) {
    ancestryFeatList.innerHTML = '<p class="muted">Для этого происхождения пока нет доступных черт.</p>';
    return;
  }

  ancestryFeatList.innerHTML = feats.map((feat) => `
    <label class="list-item">
      <div class="row">
        <input type="checkbox" name="ancestryFeat" value="${escapeHtml(feat.id)}" ${allowedIds.includes(feat.id) ? "checked" : ""} />
        <div>
          <strong>${escapeHtml(feat.name)}</strong> <span class="badge">${feat.level}</span>
          <div class="small muted">${escapeHtml(feat.description)}</div>
        </div>
      </div>
    </label>
  `).join("");

  ancestryFeatList.querySelectorAll("input[name='ancestryFeat']").forEach((el) => {
    el.addEventListener("change", () => {
      const checked = getCheckedAncestryFeatIds();
      if (checked.length > featLimit) el.checked = false;
      renderPreview();
    });
  });
}

function renderBackgroundBoostOptions(preferredPrimary, preferredFree) {
  const bg = getSelectedBackground();
  const mandatory = [{ value: "", label: "—" }, ...(bg?.boostOptions || []).map((code) => ({ value: code, label: code }))];
  const all = [{ value: "", label: "—" }, ...Object.values(ABILITY_CODE_BY_ID).map((code) => ({ value: code, label: code }))];
  setSelectOptions(backgroundBoostPrimary, mandatory.length ? mandatory : all, preferredPrimary);
  setSelectOptions(backgroundBoostFree, all, preferredFree);
}

function renderClassKeyBoostOptions(preferred) {
  const cls = getSelectedClass();
  const options = [{ value: "", label: "—" }, ...(cls?.keyAttributeOptions || Object.values(ABILITY_CODE_BY_ID)).map((code) => ({ value: code, label: code }))];
  setSelectOptions(classKeyBoost, options, preferred);
}

function renderBackgroundFeatSummary() {
  const bg = getSelectedBackground();
  if (!bg) {
    backgroundFeatSummary.textContent = "Выберите background.";
    return;
  }
  backgroundFeatSummary.textContent = bg.grantedFeatName
    ? `Background feat: ${bg.grantedFeatName}`
    : "Для этого background в knowledge не найдена явная skill feat.";
}

function renderAttributeBoostSummary() {
  const selected = getSelectedBoostCodes();
  const labels = selected.map(toAbilityLabel);
  attributeBoostSummary.textContent = labels.length
    ? `Выбраны boosts: ${labels.join(", ")} (каждый даёт +2 к соответствующему атрибуту).`
    : "Выберите boosts от background и class.";
}

function renderClassFeats(selectedIds = []) {
  const cls = getSelectedClass();
  const level = Number(byId("level").value) || 1;
  const startLevel = cls?.classFeatStartLevel || 2;
  const featLimit = classFeatSlotsForLevel(level, startLevel);
  const feats = loadClassFeats().filter((feat) => feat.classId === cls?.id && feat.level <= level);
  const allowedIds = selectedIds
    .filter((id) => feats.some((feat) => feat.id === id))
    .slice(0, featLimit);

  classFeatLimitHint.textContent = `Class feats: старт с уровня ${startLevel}, доступно на уровне ${level} — ${featLimit}.`;

  if (!cls) {
    classFeatList.innerHTML = '<p class="muted">Выберите class.</p>';
    return;
  }
  if (!feats.length) {
    classFeatList.innerHTML = '<p class="muted">Для этого class нет доступных class feats в локальной knowledge-базе.</p>';
    return;
  }

  classFeatList.innerHTML = feats.map((feat) => `
    <label class="list-item">
      <div class="row">
        <input type="checkbox" name="classFeat" value="${escapeHtml(feat.id)}" ${allowedIds.includes(feat.id) ? "checked" : ""} />
        <div>
          <strong>${escapeHtml(feat.name)}</strong> <span class="badge">${feat.level}</span>
          <div class="small muted">${escapeHtml(feat.description || "Описание не извлечено из knowledge.")}</div>
        </div>
      </div>
    </label>
  `).join("");

  classFeatList.querySelectorAll("input[name='classFeat']").forEach((el) => {
    el.addEventListener("change", () => {
      const checked = getCheckedClassFeatIds();
      if (checked.length > featLimit) el.checked = false;
      renderPreview();
    });
  });
}

function readBaseAbilities() {
  const out = {};
  for (const id of ABILITY_IDS) out[id] = Number(byId(id).value) || 0;
  return out;
}

function getCharacterFormData() {
  const cls = getSelectedClass();
  const bg = getSelectedBackground();
  const bonuses = computeAbilityBonuses();
  const baseAbilities = readBaseAbilities();
  const selectedAttributeBoosts = {
    backgroundPrimary: backgroundBoostPrimary.value || "",
    backgroundFree: backgroundBoostFree.value || "",
    classKey: classKeyBoost.value || "",
  };

  const data = {
    characterId: byId("characterId").value,
    name: byId("name").value.trim(),
    ancestry: ancestrySelect.value,
    classId: cls?.id || "",
    className: cls?.name || "—",
    backgroundId: bg?.id || "",
    background: bg?.name || "",
    backgroundFeatName: bg?.grantedFeatName || "",
    archetype: byId("archetype").value.trim(),
    level: Number(byId("level").value) || 1,
    ancestryHp: Number(byId("ancestryHp").value) || 0,
    classHp: Number(byId("classHp").value) || 0,
    ancestrySize: byId("ancestrySize").value,
    ancestrySpeed: Number(byId("ancestrySpeed").value) || 0,
    ancestryBoosts: byId("ancestryBoosts").value,
    ancestryFlaws: byId("ancestryFlaws").value,
    ancestryLanguages: byId("ancestryLanguages").value,
    ancestryTrait: byId("ancestryTrait").value,
    ancestryHeritage: byId("ancestryHeritage").value,
    itemBonusAc: Number(byId("itemBonusAc").value) || 0,
    armorProf: byId("armorProf").value,
    percProf: byId("percProf").value,
    fortProf: byId("fortProf").value,
    refProf: byId("refProf").value,
    willProf: byId("willProf").value,
    selectedFeatIds: getCheckedAncestryFeatIds(),
    selectedClassFeatIds: getCheckedClassFeatIds(),
    selectedAttributeBoosts,
  };

  for (const id of ABILITY_IDS) {
    data[`base_${id}`] = baseAbilities[id];
    data[id] = baseAbilities[id] + (bonuses[id] || 0);
  }

  return data;
}

function resetCharacterForm() {
  characterForm.reset();
  byId("characterId").value = "";
  byId("level").value = 1;

  renderClassOptions(loadCharacterClasses()[0]?.id);
  renderBackgroundOptions(loadCharacterBackgrounds()[0]?.id);
  renderClassKeyBoostOptions();
  renderBackgroundBoostOptions();
  const cls = getSelectedClass();
  const bg = getSelectedBackground();
  classKeyBoost.value = cls?.keyAttributeOptions?.[0] || "";
  backgroundBoostPrimary.value = bg?.boostOptions?.[0] || "";
  backgroundBoostFree.value = "STR";
  renderBackgroundFeatSummary();
  renderAttributeBoostSummary();

  const firstAncestry = loadAncestries()[0];
  if (firstAncestry) {
    ancestrySelect.value = firstAncestry.id;
    applyAncestryData(firstAncestry.id);
  }

  renderAncestryFeats();
  renderClassFeats();
  renderPreview();
}

function saveCharacter(character) {
  const chars = readStorage(STORAGE_KEYS.characters, []);
  if (character.characterId) {
    const idx = chars.findIndex((c) => c.id === character.characterId);
    if (idx >= 0) chars[idx] = { ...character, id: character.characterId };
  } else {
    chars.push({ ...character, id: uid("char") });
  }
  writeStorage(STORAGE_KEYS.characters, chars);
}

function deleteCharacter(id) {
  writeStorage(STORAGE_KEYS.characters, readStorage(STORAGE_KEYS.characters, []).filter((c) => c.id !== id));
}

function editCharacter(id) {
  const c = readStorage(STORAGE_KEYS.characters, []).find((v) => v.id === id);
  if (!c) return;

  byId("characterId").value = c.id;
  byId("name").value = c.name || "";
  byId("level").value = c.level || 1;

  const classFallbackId = loadCharacterClasses().find((item) => item.name === c.className)?.id || "";
  const bgFallbackId = loadCharacterBackgrounds().find((item) => item.name === c.background)?.id || "";
  classSelect.value = c.classId || classFallbackId || classSelect.value;
  backgroundSelect.value = c.backgroundId || bgFallbackId || backgroundSelect.value;

  const savedBoosts = c.selectedAttributeBoosts || {};
  renderClassKeyBoostOptions(savedBoosts.classKey || "");
  renderBackgroundBoostOptions(savedBoosts.backgroundPrimary || "", savedBoosts.backgroundFree || "");
  renderBackgroundFeatSummary();
  renderAttributeBoostSummary();

  ancestrySelect.value = c.ancestry || ancestrySelect.value;
  applyAncestryData(ancestrySelect.value);

  byId("classHp").value = c.classHp ?? 10;
  byId("itemBonusAc").value = c.itemBonusAc ?? 0;
  byId("armorProf").value = c.armorProf || "trained";
  byId("percProf").value = c.percProf || "trained";
  byId("fortProf").value = c.fortProf || "trained";
  byId("refProf").value = c.refProf || "trained";
  byId("willProf").value = c.willProf || "trained";
  byId("archetype").value = c.archetype || "";

  for (const id of ABILITY_IDS) {
    byId(id).value = c[`base_${id}`] ?? c[id] ?? 10;
  }

  renderAncestryFeats(c.selectedFeatIds || []);
  renderClassFeats(c.selectedClassFeatIds || []);
  renderPreview();
}

function renderCharacters() {
  const chars = readStorage(STORAGE_KEYS.characters, []);
  const ancestryFeats = loadAncestryFeats();
  const classFeats = loadClassFeats();

  if (!chars.length) {
    characterList.innerHTML = '<p class="muted">Пока нет персонажей.</p>';
    return;
  }

  characterList.innerHTML = chars.map((c) => {
    const s = deriveCharacterStats(c);
    const ancestryName = loadAncestries().find((a) => a.id === c.ancestry)?.name || c.ancestry;
    const ancestryFeatNames = (c.selectedFeatIds || []).map((id) => ancestryFeats.find((f) => f.id === id)?.name).filter(Boolean);
    const classFeatNames = (c.selectedClassFeatIds || []).map((id) => classFeats.find((f) => f.id === id)?.name).filter(Boolean);
    const classLabel = getClassLabel(c);
    const bgLabel = getBackgroundLabel(c);
    const boosts = formatBoostSummary(c.selectedAttributeBoosts);
    return `
      <article class="list-item">
        <div class="row">
          <div>
            <strong>${escapeHtml(c.name)}</strong> <span class="badge">Lvl ${c.level}</span>
            <div class="small muted">${escapeHtml(ancestryName)} · ${escapeHtml(classLabel)} · ${escapeHtml(bgLabel)} · HP ${s.hp} · AC ${s.ac}</div>
            <div class="small muted">Boosts: ${escapeHtml(boosts)}</div>
            <div class="small muted">Ancestry feats: ${escapeHtml(ancestryFeatNames.join(", ") || "—")}</div>
            <div class="small muted">Class feats: ${escapeHtml(classFeatNames.join(", ") || "—")}</div>
          </div>
          <div class="row" style="max-width: 260px;">
            <button data-edit="${c.id}">Изменить</button>
            <button class="danger" data-delete="${c.id}">Удалить</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  characterList.querySelectorAll("[data-edit]").forEach((btn) => btn.addEventListener("click", () => editCharacter(btn.dataset.edit)));
  characterList.querySelectorAll("[data-delete]").forEach((btn) => btn.addEventListener("click", () => {
    deleteCharacter(btn.dataset.delete);
    renderCharacters();
  }));
}

characterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveCharacter(getCharacterFormData());
  resetCharacterForm();
  renderCharacters();
});

byId("resetBtn").addEventListener("click", resetCharacterForm);

ancestrySelect.addEventListener("change", () => {
  applyAncestryData(ancestrySelect.value);
  renderAncestryFeats(getCheckedAncestryFeatIds());
  renderPreview();
});

classSelect.addEventListener("change", () => {
  renderClassKeyBoostOptions();
  renderClassFeats(getCheckedClassFeatIds());
  renderAttributeBoostSummary();
  renderPreview();
});

backgroundSelect.addEventListener("change", () => {
  renderBackgroundBoostOptions();
  renderBackgroundFeatSummary();
  renderAttributeBoostSummary();
  renderPreview();
});

byId("level").addEventListener("input", () => {
  renderAncestryFeats(getCheckedAncestryFeatIds());
  renderClassFeats(getCheckedClassFeatIds());
  renderPreview();
});

[backgroundBoostPrimary, backgroundBoostFree, classKeyBoost].forEach((selectEl) => {
  selectEl.addEventListener("change", () => {
    renderAttributeBoostSummary();
    renderPreview();
  });
});

[
  "name",
  "classHp",
  "itemBonusAc",
  "armorProf",
  "archetype",
  "percProf",
  "fortProf",
  "refProf",
  "willProf",
  ...ABILITY_IDS,
].forEach((id) => byId(id).addEventListener("input", renderPreview));

renderAncestryOptions();
renderClassOptions();
renderBackgroundOptions();
renderArchetypeOptions();
resetCharacterForm();
renderCharacters();
