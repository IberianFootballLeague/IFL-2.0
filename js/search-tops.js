document.addEventListener("DOMContentLoaded", () => {
  const buttons = [...document.querySelectorAll(".ifl-top-button[data-top]")];
  if (!buttons.length) return;
  const rankings = {
    goleadores: { title: "Máximos goleadores", message: "El ranking aparecerá aquí cuando estén cargadas las estadísticas oficiales de los jugadores." },
    partidos: { title: "Más partidos jugados", message: "El ranking aparecerá aquí cuando estén cargados los partidos oficiales y las apariciones de cada jugador." },
    dinero: { title: "Clubes con más dinero", message: "El ranking aparecerá aquí cuando se publiquen los presupuestos o saldos oficiales de los clubes." },
    titulos: { title: "Clubes con más títulos", message: "El ranking aparecerá aquí cuando estén registrados los títulos oficiales de cada club." },
    mercado: { title: "Mayores valores del mercado", message: "El ranking aparecerá aquí cuando estén disponibles los valores de mercado oficiales." }
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.getElementById(button.getAttribute("aria-controls"));
      const wasOpen = button.getAttribute("aria-expanded") === "true";
      buttons.forEach((other) => {
        other.setAttribute("aria-expanded", "false");
        const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
        if (otherPanel) { otherPanel.hidden = true; otherPanel.replaceChildren(); }
      });
      if (wasOpen || !panel) return;
      const ranking = rankings[button.dataset.top];
      if (!ranking) return;
      button.setAttribute("aria-expanded", "true");
      const heading = document.createElement("strong");
      heading.className = "ifl-top-panel__title";
      heading.textContent = ranking.title;
      const message = document.createElement("p");
      message.textContent = ranking.message;
      const note = document.createElement("span");
      note.className = "ifl-top-panel__note";
      note.textContent = "Sin datos oficiales cargados todavía";
      panel.append(heading, message, note);
      panel.hidden = false;
    });
  });
});