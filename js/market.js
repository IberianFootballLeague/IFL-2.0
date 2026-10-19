(() => {
  "use strict";
  const data = window.IFL_DATA || {};
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const newsRoot = document.getElementById("ifl-market-news");
  const movementRoot = document.getElementById("ifl-market-movements");
  const playersRoot = document.getElementById("ifl-market-players");
  const clubsRoot = document.getElementById("ifl-market-clubs");
  const dateLabel = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric"}).format(date);
  };
  const news = Array.isArray(data.news) ? data.news.slice().sort((a,b) => new Date(b.date || 0)-new Date(a.date || 0)).slice(0,3) : [];
  if (newsRoot && news.length) newsRoot.innerHTML = news.map(item => '<article class="market-news-card"><span class="market-news-card__meta">'+esc(item.category || "Comunicado oficial")+(item.date ? " · "+esc(dateLabel(item.date)) : "")+'</span><h2>'+esc(item.title || "Noticia IFL")+'</h2><p>'+esc(item.summary || item.description || "")+'</p><a href="noticias.html'+(item.id ? "?id="+encodeURIComponent(item.id) : "")+'">Leer noticia <span aria-hidden="true">→</span></a></article>').join("");
  const transfers = Array.isArray(data.transfers) ? data.transfers.filter(item => !item.status || ["confirmed","confirmed","oficial","official","completed","completed"].includes(String(item.status).toLowerCase())).sort((a,b) => new Date(b.date || 0)-new Date(a.date || 0)).slice(0,8) : [];
  if (movementRoot && transfers.length) movementRoot.innerHTML = transfers.map(item => '<article class="market-movement"><div class="market-movement__club">'+(item.fromTeamLogo ? '<img src="'+esc(item.fromTeamLogo)+'" alt="" loading="lazy">' : '')+'<span>'+esc(item.fromTeam || item.fromClub || "Origen no indicado")+'</span></div><span class="market-movement__arrow" aria-label="hacia">→</span><div class="market-movement__club">'+(item.toTeamLogo ? '<img src="'+esc(item.toTeamLogo)+'" alt="" loading="lazy">' : '')+'<span>'+esc(item.toTeam || item.toClub || "Destino no indicado")+'</span></div><div class="market-movement__info"><strong>'+esc(item.playerName || item.player || item.name || "Movimiento oficial")+'</strong><small>'+esc(item.type || "Fichaje")+(item.date ? " · "+esc(dateLabel(item.date)) : "")+(item.fee ? " · "+esc(item.fee) : "")+'</small></div></article>').join("");
  const players = Array.isArray(data.players) ? data.players : [];
  if (playersRoot && players.length) {
    playersRoot.classList.remove("market-detail-empty");
    playersRoot.innerHTML = players.slice(0,4).map(player => '<div class="market-mini-team">'+(player.photo || player.image ? '<img src="'+esc(player.photo || player.image)+'" alt="" loading="lazy">' : '')+'<span>'+esc(player.name || "Jugador")+'</span></div>').join("");
  }
  const teams = Array.isArray(data.teams) ? data.teams : [];
  if (clubsRoot && teams.length) {
    clubsRoot.classList.remove("market-detail-empty");
    clubsRoot.innerHTML = teams.slice(0,4).map(team => '<div class="market-mini-team">'+(team.logo || team.logoUrl || team.crest ? '<img src="'+esc(team.logo || team.logoUrl || team.crest)+'" alt="" loading="lazy">' : '')+'<span>'+esc(team.name || "Club IFL")+'</span></div>').join("");
  }
})();