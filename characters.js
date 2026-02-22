const characterForm = byId("characterForm");
const characterList = byId("characterList");
const preview = byId("preview");

const charInputs = ["name","ancestry","className","level","ancestryHp","classHp","itemBonusAc","armorProf","str","dex","con","int","wis","cha","percProf","fortProf","refProf","willProf","characterId"];

function getCharacterFormData() {
  const data = {};
  for (const id of charInputs) data[id] = byId(id).value;
  data.level = Number(data.level) || 1;
  ["ancestryHp","classHp","itemBonusAc","str","dex","con","int","wis","cha"].forEach((key) => data[key] = Number(data[key]) || 0);
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
  `;
}

function resetCharacterForm() {
  characterForm.reset();
  byId("characterId").value = "";
  byId("level").value = 1;
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
  renderPreview();
}

function renderCharacters() {
  const chars = readStorage(STORAGE_KEYS.characters, []);
  if (!chars.length) {
    characterList.innerHTML = `<p class="muted">Пока нет персонажей.</p>`;
    return;
  }
  characterList.innerHTML = chars.map(c => {
    const s = deriveCharacterStats(c);
    return `
      <article class="list-item">
        <div class="row">
          <div>
            <strong>${escapeHtml(c.name)}</strong> <span class="badge">Lvl ${c.level}</span>
            <div class="small muted">${escapeHtml(c.ancestry)} ${escapeHtml(c.className)} · HP ${s.hp} · AC ${s.ac}</div>
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

renderPreview();
renderCharacters();
