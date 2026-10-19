
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
  let fantasyIntroTimer = null;
  function startFantasyExperience() {
    if (document.body.dataset.authenticated !== "true") return;
    const intro = document.getElementById("fantasy-intro");
    document.body.classList.add("fantasy-mode", "fantasy-intro-active");
    document.body.classList.remove("fantasy-intro-done");
    if (fantasyIntroTimer) window.clearTimeout(fantasyIntroTimer);
    // Programa primero la salida de la intro: si una animación falla, la página no queda negra.
    let reducedMotion = false;
    try {
      reducedMotion = Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (_) {}
    fantasyIntroTimer = window.setTimeout(() => {
      document.body.classList.add("fantasy-intro-done");
      document.body.classList.remove("fantasy-intro-active");
      if (intro) {
        intro.setAttribute("aria-hidden", "true");
        intro.style.pointerEvents = "none";
        intro.style.display = "none";
      }
      const shell = document.getElementById("site-shell");
      if (shell) shell.style.display = "block";
    }, reducedMotion ? 180 : 2600);
    if (intro) {
      intro.setAttribute("aria-hidden", "false");
      intro.style.display = "grid";
      intro.style.opacity = "1";
      intro.style.visibility = "visible";
      intro.style.pointerEvents = "auto";
      const word = intro.querySelector(".fantasy-intro__word");
      if (word) {
        word.style.opacity = "1";
        word.style.visibility = "visible";
      }
      intro.querySelectorAll(".fantasy-intro__word span").forEach((letter) => {
        letter.style.display = "inline-block";
        letter.style.opacity = "1";
        letter.style.visibility = "visible";
        letter.style.color = "#ff795a";
      });
      void intro.offsetWidth;
    }
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

  // Controles visuales del mercado Fantasy. No ejecutan compras ni pujas sin backend.
  const marketTabs = Array.from(document.querySelectorAll("[data-market-type]"));
  const marketSearch = document.getElementById("fantasy-market-search");
  const marketResults = document.getElementById("fantasy-market-results");
  let marketType = "all";
  function updateFantasyMarket() {
    marketTabs.forEach((tab) => {
      const selected = tab.dataset.marketType === marketType;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-pressed", String(selected));
    });
    if (!marketResults) return;
    const query = (marketSearch?.value || "").trim().toLocaleLowerCase("es");
    const players = Array.isArray(window.IFL_DATA?.players) ? window.IFL_DATA.players : [];
    const available = players.filter((player) => {
      const text = [player.name, player.playerName, player.fullName, player.teamName, player.club, player.position].filter(Boolean).join(" ").toLocaleLowerCase("es");
      const type = String(player.marketType || player.saleType || "").toLowerCase();
      return (!query || text.includes(query)) && (marketType === "all" || type === marketType);
    });
    if (!available.length) {
      const heading = query ? "No hay coincidencias" : marketType === "auction" ? "Subastas próximamente" : marketType === "fixed" ? "Precio fijo próximamente" : "Próximamente, fichajes Fantasy";
      const paragraph = query ? "Prueba con otro nombre de jugador o club." : "El mercado visual está preparado, pero no publicamos jugadores sin datos oficiales ni permitimos transacciones sin el backend seguro.";
      marketResults.innerHTML = '<div class="fantasy-market-empty"><span class="fantasy-market-empty__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18v14H3zM7 7V4h10v3M3 12h18"/></svg></span><span class="section-kicker">MERCADO FANTASY</span><h3>' + heading + '</h3><p>' + paragraph + '</p><div class="fantasy-market-features"><span>Subastas de 24 horas</span><span>Precio fijo</span><span>Operaciones verificadas</span></div></div>';
      return;
    }
    // Aún no se renderizan anuncios sin un esquema de mercado oficial validado.
    marketResults.innerHTML = '<div class="fantasy-market-empty"><span class="section-kicker">CATÁLOGO DETECTADO</span><h3>Publicación de ofertas pendiente</h3><p>Hay datos de jugadores, pero las ofertas deben provenir del servicio de mercado Fantasy y no de los datos generales de la competición.</p></div>';
  }
  marketTabs.forEach((tab) => tab.addEventListener("click", () => { marketType = tab.dataset.marketType; updateFantasyMarket(); }));
  marketSearch?.addEventListener("input", updateFantasyMarket);
  updateFantasyMarket();
