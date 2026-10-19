
(() => {
  const buttons = Array.from(document.querySelectorAll("[data-formation]")).filter((el) => el.classList.contains("fantasy-formation-option"));
  const pitch = document.getElementById("fantasy-pitch");
  const attack = document.getElementById("fantasy-line-attack");
  const base = document.getElementById("fantasy-line-base");
  const title = document.getElementById("fantasy-active-formation");
  const description = document.getElementById("fantasy-formation-description");
  const token = (role, label) => '<span class="fantasy-position-token"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/></svg><b>' + role + '</b><small>' + label + '</small></span>';
  const formations = {
    "2-2": {
      title: "Formación 2–2",
      attack: [token("DEL", "Delantero"), token("DEL", "Delantero")],
      base: [token("DEF / MED", "Defensa o medio"), token("DEF / MED", "Defensa o medio")],
      description: "Dos delanteros obligatorios y dos jugadores que deben ser defensas o centrocampistas. No se permite portero en esta formación."
    },
    "3-1": {
      title: "Formación 3–1",
      attack: [token("DEL", "Delantero"), token("DEL", "Delantero"), token("DEL", "Delantero")],
      base: [token("DEF", "Defensa")],
      description: "Tres delanteros obligatorios y un defensa. No se permiten porteros ni centrocampistas en esta formación."
    },
    "1-1-1-1": {
      title: "Formación 1–1–1–1",
      attack: [token("DEL", "Delantero")],
      base: [token("POR", "Portero"), token("DEF", "Defensa"), token("MED", "Centrocampista")],
      description: "Un portero, un defensa, un centrocampista y un delantero: una plaza obligatoria para cada posición."
    }
  };
  function chooseFormation(name) {
    const formation = formations[name];
    if (!formation) return;
    buttons.forEach((button) => {
      const selected = button.dataset.formation === name;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    pitch.dataset.formation = name;
    title.textContent = formation.title;
    attack.innerHTML = formation.attack.join("");
    base.innerHTML = formation.base.join("");
    description.textContent = formation.description;
  }
  buttons.forEach((button) => button.addEventListener("click", () => chooseFormation(button.dataset.formation)));
  chooseFormation("2-2");
  function startFantasyExperience() {
    if (document.body.dataset.authenticated !== "true") return;
    if (document.body.classList.contains("fantasy-mode")) return;
    const intro = document.getElementById("fantasy-intro");
    document.body.classList.add("fantasy-mode", "fantasy-intro-active");
    if (intro) intro.setAttribute("aria-hidden", "false");
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      document.body.classList.add("fantasy-intro-done");
      document.body.classList.remove("fantasy-intro-active");
      if (intro) intro.setAttribute("aria-hidden", "true");
    }, reducedMotion ? 180 : 3150);
  }
  function leaveFantasyExperience() {
    document.body.classList.remove("fantasy-mode", "fantasy-intro-active", "fantasy-intro-done");
  }
  if (document.body.dataset.authenticated === "true") startFantasyExperience();
  const authObserver = new MutationObserver(() => {
    if (document.body.dataset.authenticated === "true") startFantasyExperience();
    else leaveFantasyExperience();
  });
  authObserver.observe(document.body, { attributes: true, attributeFilter: ["data-authenticated"] });
  chooseFormation("2-2");
})();