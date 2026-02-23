const classFeatForm = byId("classFeatForm");

function resetClassFeatForm() {
  classFeatForm.reset();
  byId("classFeatId").value = "";
  byId("classFeatLevel").value = 1;
}

function renderClassSelect() {
  const classes = loadCharacterClasses();
  byId("classFeatClassId").innerHTML = classes
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`)
    .join("");
}

function renderClassFeatsCrud() {
  const classes = loadCharacterClasses();
  const classById = Object.fromEntries(classes.map((item) => [item.id, item.name]));
  const feats = loadClassFeats();
  const list = byId("classFeatList");

  list.innerHTML = feats.map((feat) => `
    <article class="list-item">
      <div class="row">
        <div>
          <strong>${escapeHtml(feat.name)}</strong> <span class="badge">${feat.level}</span>
          <div class="small muted">${escapeHtml(classById[feat.classId] || feat.classId)}</div>
          <div class="small muted">${escapeHtml(feat.description || "")}</div>
          <div class="small muted">${escapeHtml(feat.source || "")}</div>
        </div>
        <div class="row" style="max-width: 220px;">
          <button data-edit-cf="${feat.id}">Изменить</button>
          <button class="danger" data-del-cf="${feat.id}">Удалить</button>
        </div>
      </div>
    </article>
  `).join("");

  list.querySelectorAll("[data-edit-cf]").forEach((btn) => btn.addEventListener("click", () => {
    const feat = feats.find((item) => item.id === btn.dataset.editCf);
    if (!feat) return;
    byId("classFeatId").value = feat.id;
    byId("classFeatCode").value = feat.id;
    byId("classFeatName").value = feat.name;
    byId("classFeatClassId").value = feat.classId;
    byId("classFeatLevel").value = feat.level;
    byId("classFeatDescription").value = feat.description || "";
    byId("classFeatSource").value = feat.source || "";
  }));

  list.querySelectorAll("[data-del-cf]").forEach((btn) => btn.addEventListener("click", () => {
    const next = feats.filter((item) => item.id !== btn.dataset.delCf);
    writeStorage(RULES_STORAGE_KEYS.classFeats, next);
    renderClassFeatsCrud();
  }));
}

classFeatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const feats = loadClassFeats();
  const id = byId("classFeatCode").value.trim();
  if (!id) return;

  const payload = {
    id,
    name: byId("classFeatName").value.trim(),
    classId: byId("classFeatClassId").value,
    level: Math.max(1, Number(byId("classFeatLevel").value) || 1),
    description: byId("classFeatDescription").value.trim(),
    source: byId("classFeatSource").value.trim(),
  };

  const idx = feats.findIndex((item) => item.id === byId("classFeatId").value || item.id === id);
  if (idx >= 0) feats[idx] = payload;
  else feats.push(payload);

  writeStorage(RULES_STORAGE_KEYS.classFeats, feats);
  resetClassFeatForm();
  renderClassFeatsCrud();
});

byId("classFeatReset").addEventListener("click", resetClassFeatForm);

renderClassSelect();
renderClassFeatsCrud();
