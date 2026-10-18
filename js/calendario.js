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
  function renderOverview(){
    const statNodes=document.querySelectorAll(".calendar-stats strong");
    const finished=matches.filter(match=>match.status==="finished"&&Number.isFinite(Number(match.homeScore))&&Number.isFinite(Number(match.awayScore)));
    const goals=finished.reduce((sum,match)=>sum+Number(match.homeScore)+Number(match.awayScore),0);
    const cardFields=matches.some(match=>Number.isFinite(Number(match.yellowCards))||Number.isFinite(Number(match.redCards)));
    const cards=matches.reduce((sum,match)=>sum+(Number(match.yellowCards)||0)+(Number(match.redCards)||0),0);
    const liveStreams=matches.filter(match=>match.status==="live"&&match.streamUrl).length;
    if(statNodes.length>=4){statNodes[0].textContent=String(matches.length);statNodes[1].textContent=String(goals);statNodes[2].textContent=cardFields?String(cards):"—";statNodes[3].textContent=liveStreams?String(liveStreams):"—";}
    const next=matches.filter(match=>match.status==="scheduled"&&dateOf(match)&&dateOf(match).getTime()>=Date.now()).sort((a,b)=>dateOf(a)-dateOf(b))[0];
    const empty=document.querySelector(".upcoming-match__empty");
    const status=document.querySelector(".upcoming-match__heading .match-status");
    const round=document.querySelector(".round-panel__heading strong");
    const roundValue=document.querySelector(".round-panel__controls span");
    if(!next){
      if(status){status.textContent="SIN PROGRAMAR";status.className="match-status match-status--empty";}
      if(round)round.textContent="Sin jornada activa";
      if(roundValue)roundValue.textContent="Sin datos";
      return;
    }
    const home=byId(next.homeTeamId),away=byId(next.awayTeamId),date=dateOf(next);
    if(status){status.textContent="PRÓXIMO";status.className="match-status";}
    if(round)round.textContent=next.round||"Próxima jornada";
    if(roundValue)roundValue.textContent=next.round||"Próximo partido";
    if(empty)empty.innerHTML='<div class="upcoming-match__fixture"><span>'+esc(home?home.name:"Equipo pendiente")+'</span><strong>vs</strong><span>'+esc(away?away.name:"Equipo pendiente")+'</span></div><p>'+esc(formatDate(date))+(next.stadium?" · "+esc(next.stadium):"")+'</p>';
  }
  const calendarGrid=document.getElementById("calendar-grid"),calendarLabel=document.getElementById("calendar-month");
  const normalizeMonth=value=>String(value||"").toLocaleLowerCase("es-ES").replace(/\\./g,"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"");
  const monthNumber=value=>{
    const target=normalizeMonth(value);
    for(let i=0;i<12;i++){
      const full=normalizeMonth(new Intl.DateTimeFormat("es-ES",{month:"long"}).format(new Date(2026,i,1)));
      const short=normalizeMonth(new Intl.DateTimeFormat("es-ES",{month:"short"}).format(new Date(2026,i,1)));
      if(target===full||target===short||target.startsWith(short.slice(0,3)))return i;
    }
    return -1;
  };
  function markCalendarDays(){
    if(!calendarGrid||!calendarLabel)return;
    const label=calendarLabel.textContent.trim(),week=calendarGrid.classList.contains("calendar-grid--week");
    let firstDate=null;
    if(week){
      const match=label.match(/(\\d{1,2})\\s+([^\\s]+)\\s*[–-]\\s*(\\d{1,2})\\s+([^\\s]+)\\s+(\\d{4})/);
      if(match){const firstMonth=monthNumber(match[2]),lastMonth=monthNumber(match[4]),year=Number(match[5]);if(firstMonth>=0&&lastMonth>=0)firstDate=new Date(year-(firstMonth>lastMonth?1:0),firstMonth,Number(match[1]));}
    }else{
      const match=label.match(/^(.+?)\\s+(\\d{4})$/),month=match?monthNumber(match[1]):-1;
      if(match&&month>=0)firstDate=new Date(Number(match[2]),month,1);
    }
    if(!firstDate)return;
    const cells=[...calendarGrid.children];
    cells.forEach((cell,index)=>{
      if(cell.classList.contains("calendar-day--empty"))return;
      cell.querySelector(".calendar-day__events")?.remove();
      let date;
      if(week){date=new Date(firstDate);date.setDate(firstDate.getDate()+index);}
      else{const day=Number.parseInt(cell.textContent,10);if(!day)return;date=new Date(firstDate.getFullYear(),firstDate.getMonth(),day);}
      const count=matches.filter(match=>{const matchDate=dateOf(match);return matchDate&&matchDate.getFullYear()===date.getFullYear()&&matchDate.getMonth()===date.getMonth()&&matchDate.getDate()===date.getDate();}).length;
      const dateText=new Intl.DateTimeFormat("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(date);
      if(count){const marker=document.createElement("span");marker.className="calendar-day__events";marker.textContent=String(count);marker.setAttribute("aria-hidden","true");cell.appendChild(marker);cell.title=count+" partido"+(count===1?"":"s")+" · "+dateText;cell.setAttribute("aria-label",dateText+", "+count+" partido"+(count===1?"":"s"));}
      else{cell.title=dateText;if(week)cell.setAttribute("aria-label",dateText);}
    });
  }
  if(calendarGrid){
    new MutationObserver(markCalendarDays).observe(calendarGrid,{childList:true});
    markCalendarDays();
  }
  [competitionFilter,clubFilter,stadiumFilter,statusFilter].filter(Boolean).forEach(select=>select.addEventListener("change",render));
  render();
  renderOverview();
})();
