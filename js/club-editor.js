(() => {
  "use strict";
  const KEY = "ifl-club-profile-c1";
  const defaults = { foundation: "", president: "", coach: "", competition: "IFL D1", stadium: "", budget: "0", primaryColor: "#05080e", secondaryColor: "#ffffff" };
  const form = document.getElementById("club-editor-form");
  const editor = document.getElementById("club-editor");
  const toggle = document.getElementById("club-edit-toggle");
  if (!form || !editor || !toggle) return;
  const get = (key) => form.querySelector('[name="' + key + '"]');
  let values = { ...defaults };
  try { values = { ...values, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch (_) {}
  const colorOK = (v, fallback) => /^#[0-9a-f]{6}$/i.test(String(v || "")) ? v : fallback;
  function render() {
    ["foundation","president","coach","competition","stadium"].forEach(key => {
      const el = document.querySelector('[data-club-value="' + key + '"]');
      if (el) el.textContent = key === "stadium" ? (values.stadium || "Información del estadio pendiente.") : (values[key] || "—");
    });
    const budget = Math.max(0, Number(values.budget) || 0);
    const amount = budget.toLocaleString("es-ES");
    const budgetValue = document.getElementById("club-budget-value");
    const budgetCaption = document.getElementById("club-budget-caption");
    if (budgetValue) budgetValue.textContent = amount;
    if (budgetCaption) budgetCaption.textContent = amount + " €";
    const primary = colorOK(values.primaryColor, defaults.primaryColor);
    const secondary = colorOK(values.secondaryColor, defaults.secondaryColor);
    const swatch1 = document.querySelector('[data-club-swatch="primary"]');
    const swatch2 = document.querySelector('[data-club-swatch="secondary"]');
    if (swatch1) swatch1.style.backgroundColor = primary;
    if (swatch2) swatch2.style.backgroundColor = secondary;
    const label = document.getElementById("club-colors-label");
    if (label) label.textContent = primary.toUpperCase() + " · " + secondary.toUpperCase();
    const crest = document.querySelector(".club-identity__crest svg");
    if (crest) {
      const paths = crest.querySelectorAll("path");
      if (paths[0]) { paths[0].setAttribute("fill", primary); paths[0].setAttribute("stroke", secondary); }
      if (paths[1]) paths[1].setAttribute("stroke", secondary);
      const text = crest.querySelector("text"); if (text) text.setAttribute("fill", secondary);
      const circle = crest.querySelector("circle"); if (circle) circle.setAttribute("fill", secondary);
    }
  }
  function fill() {
    ["foundation","coach"].forEach(key => { if (get(key)) get(key).value = values[key] ?? defaults[key]; });
    [["primaryColor","#05080e"],["secondaryColor","#ffffff"]].forEach(([key,fallback]) => {
      if (get(key)) get(key).value = colorOK(values[key], fallback);
      const text = get(key + "Text"); if (text) text.value = colorOK(values[key], fallback);
    });
  }
  function open(opened) {
    editor.hidden = !opened;
    toggle.setAttribute("aria-expanded", String(opened));
    toggle.textContent = opened ? "Cerrar editor" : "Editar ficha";
    if (opened) { fill(); editor.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }
  [["primaryColor","primaryColorText"],["secondaryColor","secondaryColorText"]].forEach(([color,text]) => {
    if (get(color) && get(text)) {
      get(color).addEventListener("input", () => { get(text).value = get(color).value; });
      get(text).addEventListener("input", () => { if (/^#[0-9a-f]{6}$/i.test(get(text).value)) get(color).value = get(text).value; });
    }
  });
  toggle.addEventListener("click", () => open(editor.hidden));
  const cancel = document.getElementById("club-edit-cancel");
  if (cancel) cancel.addEventListener("click", () => open(false));
  form.addEventListener("submit", event => {
    event.preventDefault();
    ["foundation","coach"].forEach(key => { values[key] = (get(key)?.value || "").trim(); });
    values.primaryColor = colorOK(get("primaryColorText")?.value || get("primaryColor")?.value, defaults.primaryColor);
    values.secondaryColor = colorOK(get("secondaryColorText")?.value || get("secondaryColor")?.value, defaults.secondaryColor);
    try {
      localStorage.setItem(KEY, JSON.stringify(values));
      render();
      open(false);
      const note = document.getElementById("club-editor-note");
      if (note) note.textContent = "Cambios guardados en este navegador.";
    } catch (_) {
      const note = document.getElementById("club-editor-note");
      if (note) note.textContent = "El navegador ha bloqueado el guardado. Revisa la configuración de almacenamiento.";
    }
  });
  render();
})();