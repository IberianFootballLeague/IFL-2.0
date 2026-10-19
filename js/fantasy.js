
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
        intro.style.setProperty("display", "none", "important");
        intro.style.setProperty("opacity", "0", "important");
        intro.style.setProperty("visibility", "hidden", "important");
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

  console.info("[IFL Fantasy] versión 1.3 — ajuste estricto de la pelota superior");
  function fixFantasyHeroBall() {
    const ball = document.querySelector(".fantasy-hero-ball");
    const svg = ball?.querySelector("svg");
    if (!ball || !svg) {
      console.warn("[IFL Fantasy 1.3] No se encontró la pelota de la cabecera");
      return;
    }
    ball.style.setProperty("display", "grid", "important");
    ball.style.setProperty("place-items", "center", "important");
    ball.style.setProperty("box-sizing", "border-box", "important");
    ball.style.setProperty("width", "220px", "important");
    ball.style.setProperty("min-width", "0", "important");
    ball.style.setProperty("max-width", "80%", "important");
    ball.style.setProperty("height", "220px", "important");
    ball.style.setProperty("min-height", "0", "important");
    ball.style.setProperty("max-height", "220px", "important");
    ball.style.setProperty("aspect-ratio", "1 / 1", "important");
    ball.style.setProperty("flex", "0 1 220px", "important");
    ball.style.setProperty("background", "linear-gradient(135deg, #f06445 0%, #c83a1e 100%)", "important");
    ball.style.setProperty("border-radius", "50%", "important");
    ball.style.setProperty("box-shadow", "0 25px 70px rgba(237,74,40,.24)", "important");
    ball.style.setProperty("overflow", "hidden", "important");
    svg.style.setProperty("display", "block", "important");
    svg.style.setProperty("box-sizing", "border-box", "important");
    svg.style.setProperty("width", "66%", "important");
    svg.style.setProperty("height", "66%", "important");
    svg.style.setProperty("min-width", "0", "important");
    svg.style.setProperty("max-width", "66%", "important");
    svg.style.setProperty("min-height", "0", "important");
    svg.style.setProperty("max-height", "66%", "important");
    svg.style.setProperty("fill", "none", "important");
    svg.style.setProperty("stroke", "#fff", "important");
    svg.style.setProperty("stroke-width", "2.2", "important");
    svg.querySelectorAll("*").forEach((shape) => {
      shape.style.setProperty("fill", "none", "important");
      shape.style.setProperty("stroke", "#fff", "important");
    });
    console.info("[IFL Fantasy 1.3] Pelota superior:", {
      caja: Math.round(ball.getBoundingClientRect().width) + "×" + Math.round(ball.getBoundingClientRect().height),
      fondo: getComputedStyle(ball).backgroundImage,
      svg: Math.round(svg.getBoundingClientRect().width) + "×" + Math.round(svg.getBoundingClientRect().height),
      rellenoCirculo: svg.querySelector("circle") ? getComputedStyle(svg.querySelector("circle")).fill : "sin círculo"
    });
  }
  fixFantasyHeroBall();
  function printFantasyMarketDiagnostics() {
    if (!marketResults) return;
    console.group('[IFL Fantasy] Diagnóstico visual del mercado');
    console.log('Contenedor:', marketResults.getBoundingClientRect());
    console.table(Array.from(marketResults.querySelectorAll('*')).map(function (el) {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      return { tag: el.tagName, name: el.getAttribute('class') || el.id || '', width: Math.round(r.width), height: Math.round(r.height), background: s.backgroundColor, color: s.color, display: s.display, position: s.position, src: el.currentSrc || el.getAttribute('src') || '', naturalWidth: el.naturalWidth || '', naturalHeight: el.naturalHeight || '' };
    }).filter(function (x) { return x.width > 80 || x.height > 80 || x.src || x.tag === 'SVG' || x.background === 'rgb(0, 0, 0)'; }));
    console.groupEnd();
  }
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
      fixFantasyMarketEmptyIcon();
      printFantasyMarketDiagnostics();
      return;
    }
    // Aún no se renderizan anuncios sin un esquema de mercado oficial validado.
    marketResults.innerHTML = '<div class="fantasy-market-empty"><span class="section-kicker">CATÁLOGO DETECTADO</span><h3>Publicación de ofertas pendiente</h3><p>Hay datos de jugadores, pero las ofertas deben provenir del servicio de mercado Fantasy y no de los datos generales de la competición.</p></div>';
    fixFantasyMarketEmptyIcon();
    printFantasyMarketDiagnostics();
  }
  marketTabs.forEach((tab) => tab.addEventListener("click", () => { marketType = tab.dataset.marketType; updateFantasyMarket(); }));
  marketSearch?.addEventListener("input", updateFantasyMarket);
  updateFantasyMarket();
