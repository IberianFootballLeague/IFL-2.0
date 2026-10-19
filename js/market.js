(() => {
  "use strict";
  const data = window.IFL_DATA || {};
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const $ = id => document.getElementById(id);
  const dateLabel = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric"}).format(d); };
  const dateTime = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(d); };
  const norm = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const players = Array.isArray(data.players) ? data.players : [];
  const news = Array.isArray(data.news) ? data.news.slice().sort((a,b) => new Date(b.date || 0)-new Date(a.date || 0)).slice(0,3) : [];
  const allTransfers = Array.isArray(data.transfers) ? data.transfers.slice().sort((a,b) => new Date(b.date || 0)-new Date(a.date || 0)) : [];
  const statusOf = item => {
    const raw = norm(item.status || item.state || "");
    if (["confirmed","confirmado","oficial","official","completed","completado","cerrado"].includes(raw)) return "confirmed";
    if (["negotiation","negociacion","en negociacion","pending","pendiente"].includes(raw)) return "negotiation";
    if (["rumour","rumor","rumores"].includes(raw)) return "rumour";
    return "unknown";
  };
  const statusLabel = status => ({confirmed:"Confirmado",negotiation:"En negociación",rumour:"Rumor",unknown:"Estado por confirmar"}[status] || "Estado por confirmar");
  const typeOf = item => {
    const raw = norm(item.type || item.operation || item.kind || "transfer");
    if (/cesion|loan|prestamo/.test(raw)) return "loan";
    if (/libre|free agent/.test(raw)) return "free";
    if (/salida|venta|sale|departure/.test(raw)) return "sale";
    if (/rumor|rumour/.test(raw)) return "rumour";
    return "transfer";
  };
  const typeLabel = type => ({transfer:"Fichaje",loan:"Cesión",free:"Agente libre",sale:"Salida",rumour:"Rumor"}[type] || "Movimiento");
  const clubName = item => item.name || item.clubName || item.teamName || item.club || "Club IFL";
  const clubLogo = item => item.logo || item.logoUrl || item.crest || item.badge || "";
  const getClub = name => teams.find(t => norm(clubName(t)) === norm(name));
  const logoMarkup = (logo, alt) => logo ? '<img src="'+esc(logo)+'" alt="'+esc(alt || "")+'" loading="lazy">' : '<span class="market-crest-placeholder" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s8-4 8-11V5l-8-3-8 3v5c0 7 8 11 8 11Z"/><path d="M8 9h8v6H8z"/></svg></span>';
  const newsRoot = $("ifl-market-news");
  if (newsRoot && news.length) newsRoot.innerHTML = news.map(item => '<article class="market-news-card"><span class="market-news-card__meta">'+esc(item.category || "Comunicado oficial")+(item.date ? " · "+esc(dateLabel(item.date)) : "")+'</span><h2>'+esc(item.title || "Noticia IFL")+'</h2><p>'+esc(item.summary || item.description || "")+'</p><a href="noticias.html'+(item.id ? "?id="+encodeURIComponent(item.id) : "")+'">Leer noticia <span aria-hidden="true">→</span></a></article>').join("");
  const windowConfig = data.marketWindow;
  if (windowConfig && typeof windowConfig === "object") {
    const status = norm(windowConfig.status);
    const statusEl = $("ifl-market-window-status");
    const note = $("ifl-market-window-note");
    if (statusEl && ["open","abierto","closed","cerrado"].includes(status)) {
      const open = ["open","abierto"].includes(status);
      statusEl.textContent = open ? "Mercado abierto" : "Mercado cerrado";
      statusEl.className = "market-window-status " + (open ? "is-open" : "is-closed");
    }
    if (note && windowConfig.note) note.textContent = windowConfig.note;
    const dates = $("ifl-market-window-dates");
    const parts = [];
    if (windowConfig.startDate) parts.push("<span><small>Apertura</small><strong>"+esc(dateLabel(windowConfig.startDate))+"</strong></span>");
    if (windowConfig.endDate) parts.push("<span><small>Cierre</small><strong>"+esc(dateLabel(windowConfig.endDate))+"</strong></span>");
    if (dates && parts.length) { dates.hidden = false; dates.innerHTML = parts.join(""); }
  }
  const featured = allTransfers.find(item => item.featured === true && statusOf(item) === "confirmed");
  if (featured && $("market-featured-section") && $("ifl-market-featured")) {
    $("market-featured-section").hidden = false;
    const from = featured.fromTeam || featured.fromClub || "";
    const to = featured.toTeam || featured.toClub || "";
    const fromTeam = getClub(from), toTeam = getClub(to);
    $("ifl-market-featured").innerHTML = '<div class="market-featured-player">'+(featured.playerPhoto || featured.photo || featured.image ? '<img class="market-featured-photo" src="'+esc(featured.playerPhoto || featured.photo || featured.image)+'" alt="" loading="lazy">' : '<span class="market-featured-photo market-featured-photo--empty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a8 8 0 0 1 16 0v1"/></svg></span>')+'<span class="market-featured-player__meta"><span class="market-status-badge is-confirmed">Fichaje confirmado</span><strong>'+esc(featured.playerName || featured.player || featured.name || "Jugador")+'</strong><small>'+esc(typeLabel(typeOf(featured)))+(featured.date ? " · "+esc(dateLabel(featured.date)) : "")+'</small></span></div><div class="market-featured-club">'+logoMarkup(featured.fromTeamLogo || (fromTeam && clubLogo(fromTeam)),from)+'<span>'+esc(from || "Origen no indicado")+'</span></div><span class="market-featured-arrow" aria-hidden="true">→</span><div class="market-featured-club">'+logoMarkup(featured.toTeamLogo || (toTeam && clubLogo(toTeam)),to)+'<span>'+esc(to || "Destino no indicado")+'</span></div>'+(featured.fee ? '<div class="market-featured-fee"><small>Importe</small><strong>'+esc(featured.fee)+'</strong></div>' : "");
  }
  const movementRoot = $("ifl-market-movements");
  const queryEl = $("ifl-market-filter-query"), typeEl = $("ifl-market-filter-type"), statusEl = $("ifl-market-filter-status"), clubEl = $("ifl-market-filter-club"), seasonEl = $("ifl-market-filter-season");
  const selectOptions = (el, values, label) => { if (!el) return; const current=el.value; el.innerHTML='<option value="all">'+label+'</option>'+values.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join(""); if (values.includes(current)) el.value=current; };
  const clubs = [...new Set(allTransfers.flatMap(item => [item.fromTeam || item.fromClub,item.toTeam || item.toClub]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  const seasons = [...new Set(allTransfers.map(item=>item.season).filter(Boolean).map(String))].sort((a,b)=>b.localeCompare(a,"es"));
  selectOptions(clubEl,clubs,"Todos los clubes"); selectOptions(seasonEl,seasons,"Todas las temporadas");
  const renderTransfers = () => {
    if (!movementRoot) return;
    const q = norm(queryEl && queryEl.value);
    const type = typeEl ? typeEl.value : "all";
    const status = statusEl ? statusEl.value : "all";
    const club = clubEl ? clubEl.value : "all";
    const season = seasonEl ? seasonEl.value : "all";
    const visible = allTransfers.filter(item => {
      const state=statusOf(item), kind=typeOf(item);
      const haystack=norm([item.playerName,item.player,item.name,item.fromTeam,item.fromClub,item.toTeam,item.toClub,item.type,item.season].join(" "));
      return (!q || haystack.includes(q)) && (type==="all" || kind===type) && (status==="all" || state===status) && (club==="all" || [item.fromTeam,item.fromClub,item.toTeam,item.toClub].some(n=>norm(n)===norm(club))) && (season==="all" || String(item.season || "")===season);
    });
    const official = visible.filter(item => statusOf(item)==="confirmed" && typeOf(item)!=="rumour");
    if ($("ifl-market-filter-count")) $("ifl-market-filter-count").textContent = visible.length+" operación"+(visible.length===1?"":"es")+" encontrada"+(visible.length===1?"":"s")+".";
    if (!visible.length) {
      movementRoot.innerHTML='<div class="market-empty-state"><span class="market-empty-state__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg></span><div><h3>Sin resultados</h3><p>No hay operaciones que coincidan con estos filtros.</p></div></div>';
      return;
    }
    movementRoot.innerHTML=visible.slice(0,30).map(item=>{
      const from=item.fromTeam || item.fromClub || (typeOf(item)==="free"?"Agente libre":"Origen no indicado");
      const to=item.toTeam || item.toClub || "Destino no indicado";
      const fromTeam=getClub(from),toTeam=getClub(to),state=statusOf(item),kind=typeOf(item);
      return '<article class="market-movement"><div class="market-movement__club">'+logoMarkup(item.fromTeamLogo || (fromTeam && clubLogo(fromTeam)),from)+'<span>'+esc(from)+'</span></div><span class="market-movement__arrow" aria-label="hacia">→</span><div class="market-movement__club">'+logoMarkup(item.toTeamLogo || (toTeam && clubLogo(toTeam)),to)+'<span>'+esc(to)+'</span></div><div class="market-movement__info"><strong>'+esc(item.playerName || item.player || item.name || "Movimiento")+'</strong><small>'+esc(typeLabel(kind))+(item.date?" · "+esc(dateLabel(item.date)):"")+(item.season?" · "+esc(item.season):"")+(item.fee?" · "+esc(item.fee):"")+'</small><span class="market-status-badge '+(state==="confirmed"?"is-confirmed":state==="negotiation"?"is-negotiation":state==="rumour"?"is-rumour":"is-unknown")+'">'+esc(statusLabel(state))+'</span></div></article>';
    }).join("");
  };
  [queryEl,typeEl,statusEl,clubEl,seasonEl].forEach(el=>el&&el.addEventListener(el===queryEl?"input":"change",renderTransfers));
  const clear=$("ifl-market-filter-clear");
  if (clear) clear.addEventListener("click",()=>{if(queryEl)queryEl.value="";[typeEl,statusEl,clubEl,seasonEl].forEach(el=>{if(el)el.value="all";});renderTransfers();});
  renderTransfers();
  const historyRoot=$("ifl-market-history");
  if (historyRoot) {
    const historical=allTransfers.filter(item=>item.season || item.historical===true);
    if (historical.length) historyRoot.innerHTML=historical.map(item=>'<article class="market-history-row"><div><strong>'+esc(item.playerName || item.player || item.name || "Movimiento")+'</strong><small>'+esc(item.fromTeam || item.fromClub || "Origen no indicado")+' → '+esc(item.toTeam || item.toClub || "Destino no indicado")+'</small></div><span>'+esc(item.season || "Temporada anterior")+'</span><span class="market-status-badge '+(statusOf(item)==="confirmed"?"is-confirmed":"is-unknown")+'">'+esc(statusLabel(statusOf(item)))+'</span></article>').join("");
  }
  const playersRoot=$("ifl-market-players");
  if (playersRoot && players.length) {
    playersRoot.classList.remove("market-detail-empty");
    playersRoot.innerHTML=players.slice(0,4).map(player=>'<div class="market-mini-team">'+(player.photo || player.image ? '<img src="'+esc(player.photo || player.image)+'" alt="" loading="lazy">' : '<span class="market-mini-crest">P</span>')+'<span>'+esc(player.name || "Jugador")+'</span></div>').join("");
  }
  const clubsRoot=$("ifl-market-clubs");
  if (clubsRoot && teams.length) {
    clubsRoot.classList.remove("market-detail-empty");
    clubsRoot.innerHTML=teams.slice(0,4).map(team=>'<div class="market-mini-team">'+(clubLogo(team)?'<img src="'+esc(clubLogo(team))+'" alt="" loading="lazy">':'<span class="market-mini-crest">C</span>')+'<span>'+esc(clubName(team))+'</span></div>').join("");
  }
})();