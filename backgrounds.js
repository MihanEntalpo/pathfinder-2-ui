const backgroundForm = byId("backgroundForm");
const ABILITY_CODES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

function splitAbilityCsv(value) {
  return value
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter((v) => ABILITY_CODES.includes(v));
}

function resetBackgroundForm() {
  backgroundForm.reset();
  byId("backgroundId").value = "";
  byId("backgroundFreeBoostCountInput").value = 1;
}

function renderBackgrounds() {
  const backgrounds = loadCharacterBackgrounds();
  const container = byId("backgroundList");
  container.innerHTML = backgrounds.map((bg) => `
    <article class="list-item">
      <div class="row">
        <div>
          <strong>${escapeHtml(bg.name)}</strong> <span class="badge">${escapeHtml(bg.id)}</span>
          <div class="small muted">Boost options: ${escapeHtml((bg.boostOptions || []).join(", ") || "—")} · free boosts: ${bg.freeBoostCount ?? 1}</div>
          <div class="small muted">Feat: ${escapeHtml(bg.grantedFeatName || "—")}</div>
        </div>
        <div class="row" style="max-width: 220px;">
          <button data-edit-bg="${bg.id}">Изменить</button>
          <button class="danger" data-del-bg="${bg.id}">Удалить</button>
        </div>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-edit-bg]").forEach((btn) => btn.addEventListener("click", () => {
    const bg = backgrounds.find((item) => item.id === btn.dataset.editBg);
    if (!bg) return;
    byId("backgroundId").value = bg.id;
    byId("backgroundCode").value = bg.id;
    byId("backgroundName").value = bg.name;
    byId("backgroundBoostOptionsInput").value = (bg.boostOptions || []).join(", ");
    byId("backgroundFreeBoostCountInput").value = bg.freeBoostCount ?? 1;
    byId("backgroundFeatNameInput").value = bg.grantedFeatName || "";
  }));

  container.querySelectorAll("[data-del-bg]").forEach((btn) => btn.addEventListener("click", () => {
    const next = backgrounds.filter((item) => item.id !== btn.dataset.delBg);
    writeStorage(RULES_STORAGE_KEYS.backgrounds, next);
    renderBackgrounds();
  }));
}

backgroundForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const backgrounds = loadCharacterBackgrounds();
  const id = byId("backgroundCode").value.trim();
  if (!id) return;
  const freeBoostRaw = Number(byId("backgroundFreeBoostCountInput").value);

  const payload = {
    id,
    name: byId("backgroundName").value.trim(),
    boostOptions: splitAbilityCsv(byId("backgroundBoostOptionsInput").value),
    freeBoostCount: Number.isFinite(freeBoostRaw) ? Math.max(0, Math.trunc(freeBoostRaw)) : 1,
    grantedFeatName: byId("backgroundFeatNameInput").value.trim(),
  };

  const idx = backgrounds.findIndex((item) => item.id === byId("backgroundId").value || item.id === id);
  if (idx >= 0) backgrounds[idx] = payload;
  else backgrounds.push(payload);

  writeStorage(RULES_STORAGE_KEYS.backgrounds, backgrounds);
  resetBackgroundForm();
  renderBackgrounds();
});

byId("backgroundReset").addEventListener("click", resetBackgroundForm);

renderBackgrounds();
