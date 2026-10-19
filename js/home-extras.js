(() => {
  "use strict";
  const form = document.getElementById("ifl-search-form");
  const input = document.getElementById("ifl-search-input");
  const output = document.getElementById("ifl-search-results");
  if (!form || !input || !output) return;

  const data = window.IFL_DATA || {};
  const typeFilter = document.getElementById("ifl-search-type");
  const competitionFilter = document.getElementById("ifl-search-competition");
  const clearFilters = document.getElementById("ifl-search-clear-filters");
  const recentList = document.getElementById("ifl-recent-list");
  const clearRecent = document.getElementById("ifl-clear-recent");
  const featuredList = document.getElementById("ifl-featured-list");
  const honoursForm = document.getElementById("ifl-honours-form");
  const honoursInput = document.getElementById("ifl-honours-query");
  const honoursOutput = document.getElementById("ifl-honours-results");
  const RECENT_KEY = "ifl-search-recent-v1";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const norm = value => String(value ?? "").trim().toLocaleLowerCase("es");
  const arr = value => Array.isArray(value) ? value : [];
  const teams = arr(data.teams), players = arr(data.players), matches = arr(data.matches), news = arr(data.news), stadiums = arr(data.stadiums);
  const teamName = id => teams.find(team => String(team.id) === String(id))?.name || "Equipo pendiente";
  const playerTeam = player => player.team || player.teamName || teams.find(team => String(team.id) === String(player.teamId))?.name || "";
  const competitionOf = item => item.competition || item.competitionName || item.league || "";
  const safeRecentRead = () => { try { const value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); return Array.isArray(value) ? value.filter(x => typeof x === "string").slice(0,6) : []; } catch (_) { return []; } };
  let recent = safeRecentRead();
  function saveRecent(query) {
    recent = [query, ...recent.filter(value => norm(value) !== norm(query))].slice(0,6);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (_) {}
    renderRecent();
  }
  function renderRecent() {
    if (!recentList) return;
    clearRecent.hidden = recent.length === 0;
    if (!recent.length) { recentList.innerHTML = '<p class="ifl-discovery-empty">Tus últimas búsquedas aparecerán aquí.</p>'; return; }
    recentList.innerHTML = recent.map(query => '<button type="button" class="ifl-recent-chip" data-query="' + esc(query) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>' + esc(query) + '</span></button>').join("");
  }
  function buildIndex() {
    const items = [];
    teams.forEach(team => items.push({type:"Club",title:team.name||"Club sin nombre",detail:[competitionOf(team),team.city].filter(Boolean).join(" · "),href:"equipos.html",competition:competitionOf(team)}));
    players.forEach(player => items.push({type:"Jugador",title:player.name||"Jugador sin nombre",detail:[playerTeam(player),player.position||player.role,player.number ? "Dorsal "+player.number : ""].filter(Boolean).join(" · "),href:"#jugadores-destacados",competition:competitionOf(player)}));
    matches.forEach(match => items.push({type:"Partido",title:teamName(match.homeTeamId)+" vs "+teamName(match.awayTeamId),detail:[competitionOf(match),match.date].filter(Boolean).join(" · "),href:"calendario.html",competition:competitionOf(match)}));
    stadiums.forEach(stadium => items.push({type:"Estadio",title:stadium.name||"Estadio sin nombre",detail:[stadium.teamName||teamName(stadium.teamId),stadium.city].filter(Boolean).join(" · "),href:"estadios.html",competition:competitionOf(stadium)}));
    news.forEach(item => items.push({type:"Noticia",title:item.title||"Noticia sin título",detail:item.summary||item.category||"",href:"noticias.html"+(item.id?"?id="+encodeURIComponent(item.id):""),competition:competitionOf(item)}));
    return items;
  }
  const index = buildIndex();
  const competitions = [...new Set(index.map(item => item.competition).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  if (competitionFilter) competitions.forEach(name => { const option=document.createElement("option"); option.value=name; option.textContent=name; competitionFilter.append(option); });
  function renderSearch(query, save = true) {
    const needle = norm(query);
    if (!needle) { output.innerHTML = '<p class="empty-state__description">Escribe un nombre o término para buscar.</p>'; return; }
    if (save) saveRecent(String(query).trim());
    const selectedType = typeFilter?.value || "all";
    const selectedCompetition = competitionFilter?.value || "all";
    const matchesFound = index.filter(item => {
      const text = norm([item.title,item.detail,item.type,item.competition].join(" "));
      return text.includes(needle) && (selectedType === "all" || item.type === selectedType) && (selectedCompetition === "all" || item.competition === selectedCompetition);
    }).slice(0,30);
    if (!matchesFound.length) { output.innerHTML = '<div class="empty-state"><h3>No se encontraron resultados</h3><p>Prueba con otro término o cambia los filtros. Solo se muestran datos oficiales publicados.</p></div>'; return; }
    output.innerHTML = '<div class="ifl-search-results__grid">' + matchesFound.map(item => '<a class="ifl-search-result" href="' + esc(item.href) + '"><span>' + esc(item.type) + '</span><strong>' + esc(item.title) + '</strong>' + (item.detail ? '<small>' + esc(item.detail) + '</small>' : '') + '</a>').join("") + '</div>';
  }
  form.addEventListener("submit", event => { event.preventDefault(); renderSearch(input.value); });
  typeFilter?.addEventListener("change", () => { if (input.value.trim()) renderSearch(input.value, false); });
  competitionFilter?.addEventListener("change", () => { if (input.value.trim()) renderSearch(input.value, false); });
  clearFilters?.addEventListener("click", () => { if (typeFilter) typeFilter.value="all"; if (competitionFilter) competitionFilter.value="all"; if (input.value.trim()) renderSearch(input.value, false); });
  recentList?.addEventListener("click", event => { const button=event.target.closest("[data-query]"); if (!button) return; input.value=button.dataset.query; form.requestSubmit(); input.focus(); });
  clearRecent?.addEventListener("click", () => { recent=[]; try { localStorage.removeItem(RECENT_KEY); } catch (_) {} renderRecent(); });
  renderRecent();

  if (featuredList) {
    if (!players.length) {
      featuredList.innerHTML = '<div class="ifl-discovery-empty"><strong>Jugadores pendientes de publicar</strong><span>Esta sección se completará cuando se carguen las fichas oficiales de los jugadores.</span></div>';
    } else {
      const featured = players.filter(player => player.featured === true || player.isFeatured === true).slice(0,6);
      const list = featured.length ? featured : players.slice(0,6);
      featuredList.innerHTML = list.map(player => {
        const stats=player.stats&&typeof player.stats==="object"?{...player,...player.stats}:player;
        const goals=stats.goals ?? stats.goles;
        const appearances=stats.appearances ?? stats.matches ?? stats.partidos;
        const team=playerTeam(player);
        return '<article class="ifl-featured-card">' + (player.image||player.photo ? '<img src="'+esc(player.image||player.photo)+'" alt="" loading="lazy">' : '<span class="ifl-featured-card__avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.5"/><path d="M4 21c.5-4.2 3.2-6.5 8-6.5s7.5 2.3 8 6.5"/></svg></span>') + '<div class="ifl-featured-card__body"><strong>'+esc(player.name||"Jugador")+'</strong><span>'+esc([team,player.position||player.role].filter(Boolean).join(" · ")||"Ficha oficial IFL")+'</span>' + ((goals!==undefined||appearances!==undefined)?'<small>'+[appearances!==undefined?esc(appearances)+" partidos":"",goals!==undefined?esc(goals)+" goles":""].filter(Boolean).join(" · ")+'</small>':"")+'</div></article>';
      }).join("");
    }
  }

  const honours = arr(data.honours || data.palmares || data.titles);
  if (honoursForm && honoursInput && honoursOutput) {
    honoursForm.addEventListener("submit", event => {
      event.preventDefault();
      const query=norm(honoursInput.value);
      if (!query) { honoursOutput.innerHTML='<p class="ifl-discovery-empty">Escribe un club, título, competición o temporada.</p>'; return; }
      const found=honours.filter(item => norm([item.team,item.teamName,item.club,item.title,item.name,item.competition,item.season,item.year,item.date].join(" ")).includes(query)).slice(0,30);
      if (!found.length) {
        const message=honours.length ? "No hay registros oficiales que coincidan con esa búsqueda." : "El palmarés oficial todavía no se ha cargado. No mostraremos títulos ni temporadas sin confirmar.";
        honoursOutput.innerHTML='<div class="ifl-discovery-empty"><strong>Sin resultados</strong><span>'+esc(message)+'</span></div>';
        return;
      }
      honoursOutput.innerHTML='<div class="ifl-honours__grid">'+found.map(item=>'<article class="ifl-honour-card"><span class="ifl-honour-card__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v2a5 5 0 0 0 5 5M17 6h4v2a5 5 0 0 1-5 5"/></svg></span><div><strong>'+esc(item.title||item.name||item.competition||"Título oficial")+'</strong><span>'+esc(item.team||item.teamName||item.club||"Club no indicado")+'</span><small>'+esc(item.season||item.year||item.date||"Temporada no indicada")+'</small></div></article>').join("")+'</div>';
    });
  }
})();