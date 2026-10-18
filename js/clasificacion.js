(() => {
  "use strict";
  const data=window.IFL_DATA||{teams:[],matches:[]},cards=[...document.querySelectorAll("[data-competition]")],selector=document.getElementById("standings-select"),section=document.querySelector(".standings-section"),title=document.getElementById("standings-empty-title"),description=document.getElementById("standings-empty-description"),empty=document.getElementById("standings-empty"),grid=document.querySelector(".teams-grid");
  if(!cards.length||!selector||!section||!title||!description||!empty)return;
  const labels={d1:"División 1",d2:"División 2",copa:"Copa IFL"},teams=data.teams||[],matches=data.matches||[],teamMap=new Map(teams.map(team=>[String(team.id),team]));
  const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const finished=match=>match.status==="finished"&&match.homeScore!==null&&match.homeScore!==undefined&&match.homeScore!==""&&match.awayScore!==null&&match.awayScore!==undefined&&match.awayScore!==""&&match.homeScore!==null&&match.homeScore!==undefined&&match.homeScore!==""&&match.awayScore!==null&&match.awayScore!==undefined&&match.awayScore!==""&&Number.isFinite(Number(match.homeScore))&&Number.isFinite(Number(match.awayScore));
  const teamName=id=>(teamMap.get(String(id))||{}).name||"Equipo pendiente";
  function standings(competition){
    const selected=teams.filter(team=>team.competition===competition);if(!selected.length)return null;
    const rows=new Map(selected.map(team=>[String(team.id),{team,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0}]));
    matches.filter(match=>match.competition===competition&&finished(match)).forEach(match=>{const h=rows.get(String(match.homeTeamId)),a=rows.get(String(match.awayTeamId));if(!h||!a)return;const hg=Number(match.homeScore),ag=Number(match.awayScore);h.played++;a.played++;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;if(hg>ag){h.wins++;a.losses++;h.points+=3;}else if(hg<ag){a.wins++;h.losses++;a.points+=3;}else{h.draws++;a.draws++;h.points++;a.points++;}});
    return [...rows.values()].sort((a,b)=>b.points-a.points||((b.gf-b.ga)-(a.gf-a.ga))||b.gf-a.gf||a.team.name.localeCompare(b.team.name,"es"));
  }
  function renderTable(id){
    const rows=standings(id);if(!rows||!rows.length)return false;
    const wrap=document.createElement("div");wrap.className="ifl-table-wrap";
    wrap.innerHTML='<table class="ifl-table"><caption class="visually-hidden">Clasificación de '+esc(labels[id])+'</caption><thead><tr><th scope="col">#</th><th scope="col">Club</th><th scope="col">PJ</th><th scope="col">G</th><th scope="col">E</th><th scope="col">P</th><th scope="col">GF</th><th scope="col">GC</th><th scope="col">DG</th><th scope="col">Pts</th></tr></thead><tbody>'+rows.map((row,i)=>'<tr><td>'+(i+1)+'</td><th scope="row"><a class="ifl-team-link" href="equipos.html?id='+encodeURIComponent(row.team.id)+'">'+(row.team.crest?'<img src="'+esc(row.team.crest)+'" alt="" loading="lazy" width="28" height="28">':'<span class="ifl-crest-fallback" aria-hidden="true">'+esc(row.team.name.slice(0,1).toUpperCase())+'</span>')+'<span>'+esc(row.team.name)+'</span></a></th><td>'+row.played+'</td><td>'+row.wins+'</td><td>'+row.draws+'</td><td>'+row.losses+'</td><td>'+row.gf+'</td><td>'+row.ga+'</td><td>'+(row.gf-row.ga>0?"+":"")+(row.gf-row.ga)+'</td><td><strong>'+row.points+'</strong></td></tr>').join("")+'</tbody></table>';
    empty.hidden=true;section.appendChild(wrap);return true;
  }
  function renderCup(){
    const games=matches.filter(match=>match.competition==="copa");if(!games.length)return false;
    const rounds=new Map();games.forEach(match=>{const round=match.round||"Ronda pendiente";if(!rounds.has(round))rounds.set(round,[]);rounds.get(round).push(match);});
    const bracket=document.createElement("div");bracket.className="ifl-cup-bracket";bracket.setAttribute("aria-label","Cuadro de la Copa IFL");
    bracket.innerHTML=[...rounds.entries()].map(([round,items])=>'<section class="ifl-cup-round"><h3>'+esc(round)+'</h3>'+items.map(match=>{const done=finished(match);return '<article class="ifl-cup-match"><div><span>'+esc(teamName(match.homeTeamId))+'</span><strong>'+(done?esc(match.homeScore):"–")+'</strong></div><div><span>'+esc(teamName(match.awayTeamId))+'</span><strong>'+(done?esc(match.awayScore):"–")+'</strong></div><small>'+(done?"Finalizado":match.status==="live"?"En directo":"Pendiente")+'</small></article>';}).join("")+'</section>').join("");
    empty.hidden=true;section.appendChild(bracket);return true;
  }
  function render(id){
    id=Object.prototype.hasOwnProperty.call(labels,id)?id:"";selector.value=id;
    cards.forEach(card=>{const active=card.dataset.competition===id;card.classList.toggle("is-active",active);if(active)card.setAttribute("aria-current","true");else card.removeAttribute("aria-current");});
    section.querySelectorAll(".ifl-table-wrap,.ifl-cup-bracket").forEach(node=>node.remove());empty.hidden=false;
    if(!id){title.textContent="Selecciona una competición";description.textContent="Elige D1, D2 o Copa IFL para consultar sus datos oficiales.";return;}
    title.textContent=labels[id];
    if(id==="copa"){description.textContent="Cuadro eliminatorio de la Copa IFL.";if(!renderCup())description.textContent="El cuadro aparecerá aquí cuando se publiquen los cruces oficiales.";return;}
    if(!renderTable(id))description.textContent="La clasificación aparecerá cuando se registren los clubes participantes y los resultados oficiales.";
  }
  cards.forEach(card=>card.addEventListener("click",event=>{event.preventDefault();render(card.dataset.competition);const hash="#"+card.dataset.competition;if(location.hash!==hash)history.pushState(null,"",hash);section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});}));
  selector.addEventListener("change",()=>{render(selector.value);if(selector.value&&location.hash!=="#"+selector.value)history.pushState(null,"","#"+selector.value);section.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});});
  const syncHash=()=>render(location.hash.slice(1));addEventListener("hashchange",syncHash);addEventListener("popstate",syncHash);
  if(grid){
    if(teams.length){grid.innerHTML=teams.map(team=>'<a class="team-placeholder team-card" href="equipos.html?id='+encodeURIComponent(team.id)+'">'+(team.crest?'<img src="'+esc(team.crest)+'" alt="" loading="lazy" width="42" height="42">':'<span class="ifl-crest-fallback" aria-hidden="true">'+esc(team.name.slice(0,1).toUpperCase())+'</span>')+'<strong>'+esc(team.name)+'</strong><small>'+esc(labels[team.competition]||"Club")+'</small></a>').join("");}
    else grid.innerHTML='<div class="standings-empty team-empty" role="status"><span class="standings-empty__icon" aria-hidden="true">＋</span><h3>Equipos pendientes de publicar</h3><p>Las fichas de los clubes aparecerán aquí cuando se confirmen los participantes.</p><a class="text-link" href="equipos.html">Ver sección de equipos →</a></div>';
    const note=document.querySelector(".teams-section .section-note");if(note)note.textContent=teams.length?teams.length+(teams.length===1?" equipo registrado":" equipos registrados"):"Participantes oficiales";
  }
  render(location.hash.slice(1));
})();
