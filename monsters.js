const monsterForm = byId("monsterForm");
const monsterList = byId("monsterList");
const monsterAdvice = byId("monsterAdvice");

function suggestedMonsterStats(level, role) {
  const lvl = Number(level) || 0;
  const baseAc = 14 + lvl;
  const baseAttack = 6 + lvl;
  const baseHp = Math.max(8, 15 + lvl * 8);
  const baseDamage = Math.max(3, Math.round(4 + lvl * 1.8));
  const multipliers = {
    brute: { hp: 1.25, dmg: 1.2, ac: -1 },
    skirmisher: { hp: 1, dmg: 1, ac: 0 },
    controller: { hp: 0.9, dmg: 0.85, ac: 0 },
    caster: { hp: 0.75, dmg: 1.05, ac: -1 },
    soldier: { hp: 1.1, dmg: 0.95, ac: 1 },
  }[role] || { hp: 1, dmg: 1, ac: 0 };

  return {
    ac: baseAc + multipliers.ac,
    hp: Math.round(baseHp * multipliers.hp),
    attack: baseAttack,
    damage: Math.round(baseDamage * multipliers.dmg),
  };
}

function getMonsterFormData() {
  return {
    monsterId: byId("monsterId").value,
    name: byId("mName").value,
    level: Number(byId("mLevel").value) || 0,
    role: byId("mRole").value,
    traits: byId("mTraits").value,
    ac: Number(byId("mAc").value) || 10,
    hp: Number(byId("mHp").value) || 1,
    attack: Number(byId("mAttack").value) || 0,
    damage: Number(byId("mDamage").value) || 1,
    notes: byId("mNotes").value,
  };
}

function renderMonsterAdvice() {
  const level = byId("mLevel").value;
  const role = byId("mRole").value;
  const s = suggestedMonsterStats(level, role);
  monsterAdvice.innerHTML = `
    <p>Для уровня <strong>${level}</strong> роли <strong>${role}</strong> ориентир:</p>
    <ul>
      <li>AC: ${s.ac}</li>
      <li>HP: ${s.hp}</li>
      <li>Attack: ${signed(s.attack)}</li>
      <li>Damage/удар: ${s.damage}</li>
    </ul>
    <p>Используйте как быстрый baseline под PF2 Remaster и корректируйте вручную под способности.</p>
  `;
}

function resetMonsterForm() {
  monsterForm.reset();
  byId("monsterId").value = "";
  renderMonsterAdvice();
}

function saveMonster(monster) {
  const monsters = readStorage(STORAGE_KEYS.monsters, []);
  if (monster.monsterId) {
    const idx = monsters.findIndex(m => m.id === monster.monsterId);
    if (idx >= 0) monsters[idx] = { ...monster, id: monster.monsterId };
  } else {
    monsters.push({ ...monster, id: uid("mon") });
  }
  writeStorage(STORAGE_KEYS.monsters, monsters);
}

function editMonster(id) {
  const m = readStorage(STORAGE_KEYS.monsters, []).find(v => v.id === id);
  if (!m) return;
  byId("monsterId").value = m.id;
  byId("mName").value = m.name;
  byId("mLevel").value = m.level;
  byId("mRole").value = m.role;
  byId("mTraits").value = m.traits;
  byId("mAc").value = m.ac;
  byId("mHp").value = m.hp;
  byId("mAttack").value = m.attack;
  byId("mDamage").value = m.damage;
  byId("mNotes").value = m.notes;
  renderMonsterAdvice();
}

function deleteMonster(id) {
  writeStorage(STORAGE_KEYS.monsters, readStorage(STORAGE_KEYS.monsters, []).filter(m => m.id !== id));
}

function renderMonsters() {
  const monsters = readStorage(STORAGE_KEYS.monsters, []);
  if (!monsters.length) {
    monsterList.innerHTML = `<p class="muted">Пока нет монстров.</p>`;
    return;
  }
  monsterList.innerHTML = monsters.map(m => `
    <article class="list-item">
      <div class="row">
        <div>
          <strong>${escapeHtml(m.name)}</strong> <span class="badge">Lvl ${m.level}</span> <span class="badge">${escapeHtml(m.role)}</span>
          <div class="small muted">AC ${m.ac} · HP ${m.hp} · Atk ${signed(m.attack)} · Dmg ${m.damage} · ${escapeHtml(m.traits || "no traits")}</div>
        </div>
        <div class="row" style="max-width:260px;">
          <button data-edit="${m.id}">Изменить</button>
          <button class="danger" data-delete="${m.id}">Удалить</button>
        </div>
      </div>
    </article>
  `).join("");

  monsterList.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editMonster(btn.dataset.edit)));
  monsterList.querySelectorAll("[data-delete]").forEach(btn => btn.addEventListener("click", () => { deleteMonster(btn.dataset.delete); renderMonsters(); }));
}

monsterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveMonster(getMonsterFormData());
  resetMonsterForm();
  renderMonsters();
});

byId("monsterResetBtn").addEventListener("click", resetMonsterForm);
byId("mLevel").addEventListener("input", renderMonsterAdvice);
byId("mRole").addEventListener("change", renderMonsterAdvice);

renderMonsterAdvice();
renderMonsters();
