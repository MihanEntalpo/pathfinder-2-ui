const featForm = byId("featForm");

function loadAncestrySelect() {
  const ancestries = loadAncestries();
  byId("featAncestryId").innerHTML = ancestries
    .map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`)
    .join("");
}

function resetFeatForm() {
  featForm.reset();
  byId("featId").value = "";
  byId("featLevel").value = 1;
}

function renderFeats() {
  const ancestries = loadAncestries();
  const featList = byId("featList");
  const feats = loadAncestryFeats();

  featList.innerHTML = feats.map((feat) => `
    <article class="list-item">
      <div class="row">
        <div>
          <strong>${escapeHtml(feat.name)}</strong> <span class="badge">${feat.level}</span>
          <div class="small muted">${escapeHtml(ancestries.find((a) => a.id === feat.ancestryId)?.name || feat.ancestryId)}</div>
          <div class="small muted">${escapeHtml(feat.description || "")}</div>
        </div>
        <div class="row" style="max-width: 220px;">
          <button data-edit-feat="${feat.id}">Изменить</button>
          <button class="danger" data-del-feat="${feat.id}">Удалить</button>
        </div>
      </div>
    </article>
  `).join("");

  featList.querySelectorAll("[data-edit-feat]").forEach((btn) => btn.addEventListener("click", () => {
    const feat = feats.find((item) => item.id === btn.dataset.editFeat);
    if (!feat) return;
    byId("featId").value = feat.id;
    byId("featCode").value = feat.id;
    byId("featName").value = feat.name;
    byId("featAncestryId").value = feat.ancestryId;
    byId("featLevel").value = feat.level;
    byId("featDescription").value = feat.description;
  }));

  featList.querySelectorAll("[data-del-feat]").forEach((btn) => btn.addEventListener("click", () => {
    const next = feats.filter((item) => item.id !== btn.dataset.delFeat);
    writeStorage(RULES_STORAGE_KEYS.ancestryFeats, next);
    renderFeats();
  }));
}

featForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const feats = loadAncestryFeats();
  const id = byId("featCode").value.trim();
  if (!id) return;

  const payload = {
    id,
    name: byId("featName").value.trim(),
    ancestryId: byId("featAncestryId").value,
    level: Number(byId("featLevel").value) || 1,
    description: byId("featDescription").value.trim(),
  };

  const idx = feats.findIndex((f) => f.id === byId("featId").value || f.id === id);
  if (idx >= 0) feats[idx] = payload;
  else feats.push(payload);

  writeStorage(RULES_STORAGE_KEYS.ancestryFeats, feats);
  resetFeatForm();
  renderFeats();
});

byId("featReset").addEventListener("click", resetFeatForm);

loadAncestrySelect();
renderFeats();
