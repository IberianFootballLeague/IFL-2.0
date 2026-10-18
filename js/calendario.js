(() => {
  "use strict";
  const data = window.IFL_DATA || {teams:[],matches:[]};
  const matches = data.matches || [];
  const teamMap = new Map((data.teams || []).map(team => [String(team.id),team]));
  const byId = id => teamMap.get(String(id));
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const dateOf = match => { const date = new Date(match.date); return Number.isNaN(date.getTime()) ? null : date; };
  const formatDate = date => new Intl.DateTimeFormat("es-ES",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(date);
  const competitionNames = {d1:"División 1",d2:"División 2",copa:"Copa IFL"};
  const competitionFilter = document.getElementById("calendar-competition-filter");
  const clubFilter = document.getElementById("calendar-club-filter");
  const stadiumFilter = document.getElementById("calendar-stadium-filter");
  const statusFilter = document.querySelector(".matches-status-filter select");
  const list = document.querySelector(".matches-list-card");
  if (!list) return;
  const setOptions = (select, first, values) => {
    if (!select) return;
    const current = select.value; select.innerHTML = "";
    const initial = document.createElement("option"); initial.value = ""; initial.textContent = first; select.appendChild(initial);
    [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),"es")).forEach(value=>{const option=document.createElement("option");option.value=String(value);option.textContent=String(value);select.appendChild(option);});
    if ([...select.options].some(option=>option.value===current)) select.value=current;
  };
  setOptions(competitionFilter,"Todas las competiciones",matches.map(match=>competitionNames[match.competition]||match.competition));
  setOptions(clubFilter,"Todos los clubes",(data.teams||[]).map(team=>team.name));
  setOptions(stadiumFilter,"Todos los estadios",matches.map(match=>match.stadium));
  if(statusFilter) Array.from(statusFilter.options).forEach(option=>{const text=option.textContent.trim();option.value=text==="Próximos"?"scheduled":text==="Finalizados"?"finished":text==="En directo"?"live":text==="Aplazados"?"postponed":"";});
  function render(){
    const comp=competitionFilter&&competitionFilter.value||"",club=clubFilter&&clubFilter.value||"",stadium=stadiumFilter&&stadiumFilter.value||"",status=statusFilter&&statusFilter.value||"";
    const selected=matches.filter(match=>{const home=byId(match.homeTeamId),away=byId(match.awayTeamId);return(!comp||(competitionNames[match.competition]||match.competition)===comp)&&(!club||[home&&home.name,away&&away.name].includes(club))&&(!stadium||match.stadium===stadium)&&(!status||match.status===status);}).sort((a,b)=>(dateOf(a)||0)-(dateOf(b)||0));
    if(!selected.length){list.className="matches-list-card";list.setAttribute("role","status");list.innerHTML='<span class="matches-list-card__icon" aria-hidden="true">＋</span><h3>'+(matches.length?"No hay partidos con estos filtros":"Calendario pendiente de publicar")+'</h3><p>'+(matches.length?"Prueba a cambiar los filtros seleccionados.":"Cuando se publiquen los encuentros oficiales, aparecerán aquí y en los filtros.")+'</p>';return;}
    list.removeAttribute("role");list.className="matches-list-card matches-list-card--populated";
    list.innerHTML=selected.map(match=>{const date=dateOf(match),home=byId(match.homeTeamId),away=byId(match.awayTeamId),done=match.status==="finished",live=match.status==="live",score=done||live?esc(match.homeScore==null?"–":match.homeScore)+" : "+esc(match.awayScore==null?"–":match.awayScore):"vs";return '<article class="fixture-row"><div class="fixture-row__date">'+(date?esc(formatDate(date)):"Fecha por confirmar")+'<small>'+esc(competitionNames[match.competition]||match.competition||"Competición")+(match.round?" · "+esc(match.round):"")+'</small></div><div class="fixture-row__teams"><span>'+(home&&home.crest?'<img src="'+esc(home.crest)+'" alt="" loading="lazy" width="28" height="28">':'')+esc(home?home.name:"Equipo pendiente")+'</span><strong class="fixture-row__score'+(live?' is-live':'')+'">'+score+'</strong><span>'+(away&&away.crest?'<img src="'+esc(away.crest)+'" alt="" loading="lazy" width="28" height="28">':'')+esc(away?away.name:"Equipo pendiente")+'</span></div><div class="fixture-row__meta"><span>'+esc(match.stadium||"Estadio por confirmar")+'</span><span class="fixture-status">'+(live?"En directo":done?"Finalizado":match.status==="postponed"?"Aplazado":"Pendiente")+'</span></div></article>';}).join("");
  }
  [competitionFilter,clubFilter,stadiumFilter,statusFilter].filter(Boolean).forEach(select=>select.addEventListener("change",render));
  render();
})();
