const characterForm = byId("characterForm");
const characterList = byId("characterList");
const preview = byId("preview");
const ancestrySelect = byId("ancestry");
const ancestryFeatList = byId("ancestryFeatList");
const featLimitHint = byId("featLimitHint");

const charInputs = ["name","ancestry","className","level","ancestryHp","classHp","itemBonusAc","armorProf","str","dex","con","int","wis","cha","percProf","fortProf","refProf","willProf","characterId","ancestrySize","ancestrySpeed","ancestryBoosts","ancestryFlaws","ancestryLanguages","ancestryTrait","ancestryHeritage"];

function featSlotsForLevel(level) {
  const base = 1;
  const bonusLevels = [5, 9, 13, 17];
  return base + bonusLevels.filter((lvl) => level >= lvl).length;
}

function getCheckedFeatIds() {
  return Array.from(document.querySelectorAll("input[name='ancestryFeat']:checked")).map((el) => el.value);
}

function getCharacterFormData() {
  const data = {};
  for (const id of charInputs) data[id] = byId(id).value;
  data.level = Number(data.level) || 1;
  ["ancestryHp","ancestrySpeed","classHp","itemBonusAc","str","dex","con","int","wis","cha"].forEach((key) => data[key] = Number(data[key]) || 0);
  data.selectedFeatIds = getCheckedFeatIds();
  return data;
}

function renderPreview() {
  const c = getCharacterFormData();
  const s = deriveCharacterStats(c);
  preview.innerHTML = `
    <p><span class="badge">Lvl ${c.level}</span> <span class="badge">${escapeHtml(c.ancestry)} ${escapeHtml(c.className)}</span></p>
    <p>HP: <span class="stat">${s.hp}</span> | AC: <span class="stat">${s.ac}</span> | Perception: <span class="stat">${signed(s.perception)}</span></p>
    <p>Fort ${signed(s.fort)} | Ref ${signed(s.reflex)} | Will ${signed(s.will)}</p>
    <p>STR ${signed(s.mods.str)} DEX ${signed(s.mods.dex)} CON ${signed(s.mods.con)} INT ${signed(s.mods.int)} WIS ${signed(s.mods.wis)} CHA ${signed(s.mods.cha)}</p>
    <p>Черты происхождения: ${c.selectedFeatIds.length}</p>
  `;
}

function renderAncestryOptions() {
  const ancestries = loadAncestries();
  ancestrySelect.innerHTML = ancestries.map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`).join("");
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

  featLimitHint.textContent = `На уровне ${level} можно выбрать ${featLimit} черт(ы) происхождения.`;

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
      const checked = getCheckedFeatIds();
      if (checked.length > featLimit) {
        el.checked = false;
      }
      renderPreview();
    });
  });
}

function resetCharacterForm() {
  characterForm.reset();
  byId("characterId").value = "";
  byId("level").value = 1;
  const first = loadAncestries()[0];
  if (first) {
    ancestrySelect.value = first.id;
    applyAncestryData(first.id);
  }
  renderAncestryFeats();
  renderPreview();
}

function saveCharacter(character) {
  const chars = readStorage(STORAGE_KEYS.characters, []);
  if (character.characterId) {
    const idx = chars.findIndex(c => c.id === character.characterId);
    if (idx >= 0) chars[idx] = { ...character, id: character.characterId };
  } else {
    chars.push({ ...character, id: uid("char") });
  }
  writeStorage(STORAGE_KEYS.characters, chars);
}

function deleteCharacter(id) {
  const chars = readStorage(STORAGE_KEYS.characters, []).filter(c => c.id !== id);
  writeStorage(STORAGE_KEYS.characters, chars);
}

function editCharacter(id) {
  const c = readStorage(STORAGE_KEYS.characters, []).find(v => v.id === id);
  if (!c) return;
  Object.entries(c).forEach(([key, val]) => {
    const el = byId(key);
    if (el) el.value = val;
  });
  byId("characterId").value = c.id;
  applyAncestryData(c.ancestry);
  renderAncestryFeats(c.selectedFeatIds || []);
  renderPreview();
}

function renderCharacters() {
  const chars = readStorage(STORAGE_KEYS.characters, []);
  const feats = loadAncestryFeats();
  if (!chars.length) {
    characterList.innerHTML = `<p class="muted">Пока нет персонажей.</p>`;
    return;
  }
  characterList.innerHTML = chars.map(c => {
    const s = deriveCharacterStats(c);
    const featNames = (c.selectedFeatIds || []).map((id) => feats.find((f) => f.id === id)?.name).filter(Boolean).join(", ") || "—";
    const ancestryName = loadAncestries().find((a) => a.id === c.ancestry)?.name || c.ancestry;
    return `
      <article class="list-item">
        <div class="row">
          <div>
            <strong>${escapeHtml(c.name)}</strong> <span class="badge">Lvl ${c.level}</span>
            <div class="small muted">${escapeHtml(ancestryName)} ${escapeHtml(c.className)} · HP ${s.hp} · AC ${s.ac}</div>
            <div class="small muted">Черты: ${escapeHtml(featNames)}</div>
          </div>
          <div class="row" style="max-width: 260px;">
            <button data-edit="${c.id}">Изменить</button>
            <button class="danger" data-delete="${c.id}">Удалить</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  characterList.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editCharacter(btn.dataset.edit)));
  characterList.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => {
    deleteCharacter(btn.dataset.delete);
    renderCharacters();
  }));
}

characterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const character = getCharacterFormData();
  saveCharacter(character);
  resetCharacterForm();
  renderCharacters();
});

byId("resetBtn").addEventListener("click", resetCharacterForm);
charInputs.filter(id => id !== "characterId").forEach(id => byId(id).addEventListener("input", renderPreview));

ancestrySelect.addEventListener("change", () => {
  applyAncestryData(ancestrySelect.value);
  renderAncestryFeats();
  renderPreview();
});

byId("level").addEventListener("input", () => {
  renderAncestryFeats(getCheckedFeatIds());
  renderPreview();
});

renderAncestryOptions();
resetCharacterForm();
renderCharacters();
