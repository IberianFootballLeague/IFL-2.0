(() => {
  "use strict";

  const cards = Array.from(document.querySelectorAll("[data-competition]"));
  const selector = document.getElementById("standings-select");
  const standingsSection = document.querySelector(".standings-section");
  const title = document.getElementById("standings-empty-title");
  const description = document.getElementById("standings-empty-description");

  if (!cards.length || !selector || !standingsSection || !title || !description) return;

  const competitions = {
    d1: {
      name: "División 1",
      message: "La clasificación de División 1 todavía no está configurada."
    },
    d2: {
      name: "División 2",
      message: "La clasificación de División 2 todavía no está configurada."
    },
    copa: {
      name: "Copa IFL",
      message: "La clasificación de Copa IFL todavía no está configurada."
    }
  };

  let activeCompetition = "";

  function normalizeCompetition(value) {
    return Object.prototype.hasOwnProperty.call(competitions, value) ? value : "";
  }

  function renderCompetition(value) {
    const competitionId = normalizeCompetition(value);
    activeCompetition = competitionId;
    selector.value = competitionId;

    cards.forEach((card) => {
      const isActive = card.dataset.competition === competitionId;
      card.classList.toggle("is-active", isActive);
      if (isActive) {
        card.setAttribute("aria-current", "true");
      } else {
        card.removeAttribute("aria-current");
      }
    });

    if (!competitionId) {
      title.textContent = "Selecciona una competición";
      description.textContent = "Elige D1, D2 o Copa IFL para consultar su clasificación.";
      return;
    }

    const competition = competitions[competitionId];
    title.textContent = competition.name;
    description.textContent = competition.message;
  }

  function setCompetition(value, options) {
    const settings = options || {};
    const competitionId = normalizeCompetition(value);
    renderCompetition(competitionId);

    if (settings.updateHash) {
      const nextHash = competitionId ? "#" + competitionId : window.location.pathname + window.location.search;
      if (competitionId) {
        if (window.location.hash !== nextHash) window.history.pushState(null, "", nextHash);
      } else if (window.location.hash) {
        window.history.pushState(null, "", nextHash);
      }
    }

    if (settings.scroll) {
      standingsSection.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    }
  }

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      setCompetition(card.dataset.competition, { updateHash: true, scroll: true });
    });
  });

  selector.addEventListener("change", () => {
    setCompetition(selector.value, { updateHash: true, scroll: true });
  });

  window.addEventListener("hashchange", () => {
    setCompetition(window.location.hash.slice(1));
  });

  window.addEventListener("popstate", () => {
    setCompetition(window.location.hash.slice(1));
  });

  const initialCompetition = normalizeCompetition(window.location.hash.slice(1));
  renderCompetition(initialCompetition);
  if (initialCompetition) {
    // El enlace profundo selecciona la tabla sin alterar la autenticación existente.
    window.requestAnimationFrame(() => {
      standingsSection.scrollIntoView({ behavior: "auto", block: "start" });
    });
  }
})();
