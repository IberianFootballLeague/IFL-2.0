(() => {
  "use strict";
  const data=window.IFL_DATA||{teams:[],matches:[],news:[],playerOfRound:null};
  const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const teams=data.teams||[],matches=data.matches||[],news=data.news||[];
  const teamMap=new Map(teams.map(team=>[String(team.id),team]));
  const name=id=>(teamMap.get(String(id))||{}).name||"Equipo pendiente";
  const finished=matches.filter(match=>match.status==="finished"&&match.homeScore!==null&&match.homeScore!==undefined&&match.homeScore!==""&&match.awayScore!==null&&match.awayScore!==undefined&&match.awayScore!==""&&match.homeScore!==null&&match.homeScore!==undefined&&match.homeScore!==""&&match.awayScore!==null&&match.awayScore!==undefined&&match.awayScore!==""&&Number.isFinite(Number(match.homeScore))&&Number.isFinite(Number(match.awayScore)));
  const goals=finished.reduce((sum,match)=>sum+Number(match.homeScore)+Number(match.awayScore),0);
  const upcoming=matches.filter(match=>match.status==="scheduled"&&Number.isFinite(new Date(match.date).getTime())).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const dateLabel=value=>new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(value));
  const stats=document.querySelectorAll(".home-hero__stat strong");
  if(stats.length>=4){stats[0].textContent=teams.length?String(teams.length):"—";stats[1].textContent=finished.length?String(goals):"—";stats[2].textContent=finished.length?String(finished.length):"—";stats[3].textContent="3";}
  const matchSection=document.querySelector('[aria-labelledby="matches-title"] .empty-state');
  if(matchSection&&upcoming.length){matchSection.className="home-fixtures";matchSection.innerHTML=upcoming.slice(0,4).map(match=>'<article class="home-fixture"><small>'+esc(dateLabel(match.date))+' · '+esc(match.competition||"Competición")+'</small><div><span>'+esc(name(match.homeTeamId))+'</span><strong>vs</strong><span>'+esc(name(match.awayTeamId))+'</span></div></article>').join("")+'<a class="text-link" href="calendario.html">Ver calendario completo →</a>';}
  const newsSection=document.querySelector('[aria-labelledby="news-title"] .empty-state');
  if(newsSection&&news.length){newsSection.className="home-news-grid";newsSection.innerHTML=news.slice().sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,3).map(item=>'<article class="home-news-card"><small>'+esc(item.category||"Comunicado oficial")+(item.date?" · "+esc(new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"short",year:"numeric"}).format(new Date(item.date))):"")+'</small><h3>'+esc(item.title)+'</h3><p>'+esc(item.summary||"")+'</p><a class="text-link" href="noticias.html?id='+encodeURIComponent(item.id)+'">Leer noticia →</a></article>').join("")+'<a class="text-link" href="noticias.html">Todas las noticias →</a>';}
  const playerSection=document.querySelector('[aria-labelledby="player-title"] .empty-state');
  if(playerSection&&data.playerOfRound){const player=data.playerOfRound;playerSection.innerHTML='<h3>'+esc(player.name||"Jugador de la jornada")+'</h3><p>'+esc(player.team||"")+(player.round?" · "+esc(player.round):"")+'</p>';}
})();
