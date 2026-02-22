const gameForm = byId("gameForm");
const gamesList = byId("gamesList");
const tracker = byId("tracker");
const activeGameHint = byId("activeGameHint");

let activeGameId = null;

function getGames() { return readStorage(STORAGE_KEYS.games, []); }
function setGames(v) { writeStorage(STORAGE_KEYS.games, v); }

function getParticipants() {
  const chars = readStorage(STORAGE_KEYS.characters, []).map(c => ({
    id: `char:${c.id}`,
    label: `${c.name} (PC L${c.level})`,
    maxHp: deriveCharacterStats(c).hp,
    ac: deriveCharacterStats(c).ac,
    type: "character",
  }));
  const mons = readStorage(STORAGE_KEYS.monsters, []).map(m => ({
    id: `mon:${m.id}`,
    label: `${m.name} (Mon L${m.level})`,
    maxHp: m.hp,
    ac: m.ac,
    type: "monster",
  }));
  return [...chars, ...mons];
}

function saveGame(data) {
  const games = getGames();
  if (data.gameId) {
    const idx = games.findIndex(g => g.id === data.gameId);
    if (idx >= 0) games[idx] = { ...games[idx], name: data.name, notes: data.notes };
  } else {
    games.push({ id: uid("game"), name: data.name, notes: data.notes, combatants: [] });
  }
  setGames(games);
}

function deleteGame(id) {
  setGames(getGames().filter(g => g.id !== id));
  if (activeGameId === id) activeGameId = null;
}

function setActiveGame(id) {
  activeGameId = id;
  renderTracker();
  renderGames();
}

function addCombatant(participantId) {
  const games = getGames();
  const game = games.find(g => g.id === activeGameId);
  const p = getParticipants().find(v => v.id === participantId);
  if (!game || !p) return;
  game.combatants.push({ id: uid("cmb"), ref: p.id, label: p.label, hp: p.maxHp, maxHp: p.maxHp, ac: p.ac, initiative: 0, conditions: "", notes: "" });
  setGames(games);
  renderTracker();
}

function updateCombatant(combatantId, patch) {
  const games = getGames();
  const game = games.find(g => g.id === activeGameId);
  if (!game) return;
  const idx = game.combatants.findIndex(c => c.id === combatantId);
  if (idx < 0) return;
  game.combatants[idx] = { ...game.combatants[idx], ...patch };
  setGames(games);
}

function removeCombatant(combatantId) {
  const games = getGames();
  const game = games.find(g => g.id === activeGameId);
  if (!game) return;
  game.combatants = game.combatants.filter(c => c.id !== combatantId);
  setGames(games);
  renderTracker();
}

function renderGames() {
  const games = getGames();
  if (!games.length) {
    gamesList.innerHTML = `<p class="muted">Сессий пока нет.</p>`;
    return;
  }

  gamesList.innerHTML = games.map(g => `
    <article class="list-item">
      <strong>${escapeHtml(g.name)}</strong> ${activeGameId === g.id ? '<span class="badge">active</span>' : ""}
      <div class="small muted">${escapeHtml(g.notes || "без описания")}</div>
      <div class="row" style="margin-top:.45rem;">
        <button data-open="${g.id}">Открыть</button>
        <button data-edit="${g.id}">Изменить</button>
        <button class="danger" data-del="${g.id}">Удалить</button>
      </div>
    </article>
  `).join("");

  gamesList.querySelectorAll("[data-open]").forEach(btn => btn.addEventListener("click", () => setActiveGame(btn.dataset.open)));
  gamesList.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => { deleteGame(btn.dataset.del); renderGames(); renderTracker(); }));
  gamesList.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const game = getGames().find(g => g.id === btn.dataset.edit);
    if (!game) return;
    byId("gameId").value = game.id;
    byId("gName").value = game.name;
    byId("gNotes").value = game.notes;
  }));
}

function renderTracker() {
  const game = getGames().find(g => g.id === activeGameId);
  if (!game) {
    activeGameHint.textContent = "Выберите игру слева.";
    tracker.innerHTML = "";
    return;
  }

  activeGameHint.textContent = `Активная игра: ${game.name}`;
  const options = getParticipants().map(p => `<option value="${p.id}">${escapeHtml(p.label)} [HP ${p.maxHp} AC ${p.ac}]</option>`).join("");

  tracker.innerHTML = `
    <div class="panel">
      <label>Добавить участника в трекер</label>
      <div class="row">
        <select id="participantSelect">${options}</select>
        <button id="addParticipantBtn">Добавить</button>
      </div>
    </div>
    <div class="panel">
      <h3>Инициатива и состояние</h3>
      <table class="table">
        <thead><tr><th>Участник</th><th>Init</th><th>HP</th><th>AC</th><th>Conditions</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          ${game.combatants.sort((a,b) => b.initiative - a.initiative).map(c => `
            <tr>
              <td>${escapeHtml(c.label)}</td>
              <td><input data-init="${c.id}" type="number" value="${c.initiative}" /></td>
              <td><input data-hp="${c.id}" type="number" value="${c.hp}" /> / ${c.maxHp}</td>
              <td>${c.ac}</td>
              <td><input data-cond="${c.id}" value="${escapeHtml(c.conditions)}" /></td>
              <td><input data-note="${c.id}" value="${escapeHtml(c.notes)}" /></td>
              <td><button class="danger" data-remove="${c.id}">X</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  byId("addParticipantBtn").addEventListener("click", () => {
    addCombatant(byId("participantSelect").value);
  });

  tracker.querySelectorAll("[data-remove]").forEach(el => el.addEventListener("click", () => removeCombatant(el.dataset.remove)));
  tracker.querySelectorAll("[data-init]").forEach(el => el.addEventListener("input", () => updateCombatant(el.dataset.init, { initiative: Number(el.value) || 0 })));
  tracker.querySelectorAll("[data-hp]").forEach(el => el.addEventListener("input", () => updateCombatant(el.dataset.hp, { hp: Number(el.value) || 0 })));
  tracker.querySelectorAll("[data-cond]").forEach(el => el.addEventListener("input", () => updateCombatant(el.dataset.cond, { conditions: el.value })));
  tracker.querySelectorAll("[data-note]").forEach(el => el.addEventListener("input", () => updateCombatant(el.dataset.note, { notes: el.value })));
}

gameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  saveGame({ gameId: byId("gameId").value, name: byId("gName").value, notes: byId("gNotes").value });
  gameForm.reset();
  byId("gameId").value = "";
  renderGames();
});

renderGames();
renderTracker();
