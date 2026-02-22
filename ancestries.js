const ancestryForm = byId("ancestryForm");

function splitCsv(value) {
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function resetAncestryForm() {
  ancestryForm.reset();
  byId("ancestryId").value = "";
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
    const ancestryId = btn.dataset.delAncestry;
    const next = ancestries.filter((item) => item.id !== ancestryId);
    writeStorage(RULES_STORAGE_KEYS.ancestries, next);
    const feats = loadAncestryFeats().filter((feat) => feat.ancestryId !== ancestryId);
    writeStorage(RULES_STORAGE_KEYS.ancestryFeats, feats);
    renderAncestries();
  }));
}

ancestryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ancestries = loadAncestries();
  const id = byId("ancestryCode").value.trim();
  if (!id) return;

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
});

byId("ancestryReset").addEventListener("click", resetAncestryForm);

renderAncestries();
