(() => {
  "use strict";
  const root=document.getElementById("cup-bracket");if(!root)return;
  const data=window.IFL_DATA||{teams:[],matches:[]},teams=data.teams||[],games=(data.matches||[]).filter(match=>match.competition==="copa");
  const team=id=>(teams.find(item=>String(item.id)===String(id))||{}).name||"Equipo pendiente";
  const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  if(!games.length){root.innerHTML='<div class="standings-empty" role="status"><span class="standings-empty__icon" aria-hidden="true">＋</span><h2>Cuadro pendiente de publicar</h2><p>Los cruces, resultados y rondas de la Copa IFL aparecerán cuando se confirmen oficialmente.</p><a class="text-link" href="clasificacion.html#copa">Ver competiciones →</a></div>';return;}
  const rounds=new Map();games.forEach(match=>{const round=match.round||"Ronda pendiente";if(!rounds.has(round))rounds.set(round,[]);rounds.get(round).push(match);});
  const done=match=>match.status==="finished"&&Number.isFinite(Number(match.homeScore))&&Number.isFinite(Number(match.awayScore));
  root.innerHTML=[...rounds.entries()].map(([round,items])=>'<section class="ifl-cup-round"><h2>'+esc(round)+'</h2>'+items.map(match=>'<article class="ifl-cup-match"><div><span>'+esc(team(match.homeTeamId))+'</span><strong>'+(done(match)?esc(match.homeScore):"–")+'</strong></div><div><span>'+esc(team(match.awayTeamId))+'</span><strong>'+(done(match)?esc(match.awayScore):"–")+'</strong></div><small>'+(done(match)?"Finalizado":match.status==="live"?"En directo":match.status==="postponed"?"Aplazado":"Pendiente")+'</small></article>').join("")+'</section>').join("");
})();
