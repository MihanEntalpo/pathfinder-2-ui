const ancestryForm = byId("ancestryForm");
const featForm = byId("featForm");

function splitCsv(value) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function loadAncestrySelect() {
  const ancestries = loadAncestries();
  byId("featAncestryId").innerHTML = ancestries.map((a) => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`).join("");
}

function resetAncestryForm() {
  ancestryForm.reset();
  byId("ancestryId").value = "";
}

function resetFeatForm() {
  featForm.reset();
  byId("featId").value = "";
  byId("featLevel").value = 1;
}

function renderAncestries() {
  const ancestries = loadAncestries();
  const container = byId("ancestryList");
  container.innerHTML = ancestries.map((a) => `
    <article class="list-item">
      <div class="row">
        <div>
          <strong>${escapeHtml(a.name)}</strong> <span class="badge">${escapeHtml(a.id)}</span>
          <div class="small muted">HP ${a.hp} · ${escapeHtml(a.size)} · Speed ${a.speed}</div>
        </div>
        <div class="row" style="max-width: 220px;">
          <button data-edit-ancestry="${a.id}">Изменить</button>
          <button class="danger" data-del-ancestry="${a.id}">Удалить</button>
        </div>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-edit-ancestry]").forEach((btn) => btn.addEventListener("click", () => {
    const a = ancestries.find((item) => item.id === btn.dataset.editAncestry);
    if (!a) return;
    byId("ancestryId").value = a.id;
    byId("ancestryCode").value = a.id;
    byId("ancestryName").value = a.name;
    byId("ancestryHpInput").value = a.hp;
    byId("ancestrySizeInput").value = a.size;
    byId("ancestrySpeedInput").value = a.speed;
    byId("ancestryBoostsInput").value = a.boosts.join(", ");
    byId("ancestryFlawsInput").value = a.flaws.join(", ");
    byId("ancestryLanguagesInput").value = a.languages.join(", ");
    byId("ancestryTraitInput").value = a.trait;
    byId("ancestryHeritageInput").value = a.heritage;
  }));

  container.querySelectorAll("[data-del-ancestry]").forEach((btn) => btn.addEventListener("click", () => {
    const next = ancestries.filter((item) => item.id !== btn.dataset.delAncestry);
    writeStorage(RULES_STORAGE_KEYS.ancestries, next);
    const feats = loadAncestryFeats().filter((feat) => feat.ancestryId !== btn.dataset.delAncestry);
    writeStorage(RULES_STORAGE_KEYS.ancestryFeats, feats);
    renderAncestries();
    renderFeats();
    loadAncestrySelect();
  }));
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

ancestryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ancestries = loadAncestries();
  const id = byId("ancestryCode").value.trim();
  const payload = {
    id,
    name: byId("ancestryName").value.trim(),
    hp: Number(byId("ancestryHpInput").value) || 6,
    size: byId("ancestrySizeInput").value.trim(),
    speed: Number(byId("ancestrySpeedInput").value) || 25,
    boosts: splitCsv(byId("ancestryBoostsInput").value),
    flaws: splitCsv(byId("ancestryFlawsInput").value),
    languages: splitCsv(byId("ancestryLanguagesInput").value),
    trait: byId("ancestryTraitInput").value.trim(),
    heritage: byId("ancestryHeritageInput").value.trim(),
  };

  const idx = ancestries.findIndex((a) => a.id === byId("ancestryId").value || a.id === id);
  if (idx >= 0) ancestries[idx] = payload;
  else ancestries.push(payload);
  writeStorage(RULES_STORAGE_KEYS.ancestries, ancestries);
  resetAncestryForm();
  renderAncestries();
  loadAncestrySelect();
});

featForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const feats = loadAncestryFeats();
  const id = byId("featCode").value.trim();
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

byId("ancestryReset").addEventListener("click", resetAncestryForm);
byId("featReset").addEventListener("click", resetFeatForm);

loadAncestrySelect();
renderAncestries();
renderFeats();
