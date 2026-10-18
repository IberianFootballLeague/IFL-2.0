(() => {
  "use strict";
  const form = document.getElementById("ifl-search-form");
  const input = document.getElementById("ifl-search-input");
  const output = document.getElementById("ifl-search-results");
  if (!form || !input || !output) return;

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const data = window.IFL_DATA || { teams: [], matches: [], news: [] };

  function buildIndex() {
    const items = [];
    (data.teams || []).forEach((team) => items.push({
      type: "Club", title: team.name || "Club sin nombre",
      detail: [team.competition, team.city].filter(Boolean).join(" · "),
      href: "equipos.html"
    }));
    (data.matches || []).forEach((match) => {
      const teamName = (id) => (data.teams || []).find((team) => String(team.id) === String(id))?.name || "Equipo pendiente";
      items.push({
        type: "Partido",
        title: teamName(match.homeTeamId) + " vs " + teamName(match.awayTeamId),
        detail: [match.competition, match.date].filter(Boolean).join(" · "),
        href: "calendario.html"
      });
    });
    (data.news || []).forEach((item) => items.push({
      type: "Noticia", title: item.title || "Noticia sin título",
      detail: item.summary || item.category || "",
      href: "noticias.html" + (item.id ? "?id=" + encodeURIComponent(item.id) : "")
    }));
    return items;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase("es");
    if (!query) {
      output.innerHTML = '<p class="empty-state__description">Escribe un nombre o término para buscar.</p>';
      return;
    }
    const matches = buildIndex().filter((item) =>
      (item.title + " " + item.detail + " " + item.type).toLocaleLowerCase("es").includes(query)
    ).slice(0, 20);
    if (!matches.length) {
      output.innerHTML = '<div class="empty-state"><h3>No se encontraron resultados</h3><p>Prueba con otro término. Solo se buscan datos oficiales que estén publicados en la web.</p></div>';
      return;
    }
    output.innerHTML = '<div class="ifl-search-results__grid">' + matches.map((item) =>
      '<a class="ifl-search-result" href="' + esc(item.href) + '"><span>' + esc(item.type) +
      '</span><strong>' + esc(item.title) + '</strong>' +
      (item.detail ? '<small>' + esc(item.detail) + '</small>' : '') + '</a>'
    ).join("") + '</div>';
  });
})();