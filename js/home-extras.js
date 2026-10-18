(() => {
  "use strict";
  const data=window.IFL_DATA||{teams:[],matches:[],news:[]};
  const teams=data.teams||[],matches=data.matches||[],news=data.news||[];
  const input=document.getElementById("ifl-search"),results=document.getElementById("ifl-search-results"),stadiums=document.getElementById("ifl-stadiums");
  const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const teamMap=new Map(teams.map(team=>[String(team.id),team]));
  const teamName=id=>(teamMap.get(String(id))||{}).name||"Equipo pendiente";
  if(stadiums){
    const withStadium=teams.filter(team=>typeof team.stadium==="string"&&team.stadium.trim());
    stadiums.innerHTML=withStadium.length?withStadium.map(team=>'<a class="directory-card" href="equipos.html?id='+encodeURIComponent(team.id)+'">'+(team.crest?'<img src="'+esc(team.crest)+'" alt="" loading="lazy" width="56" height="56">':'<span class="ifl-crest-fallback" aria-hidden="true">'+esc((team.name||"?").slice(0,1).toUpperCase())+'</span>')+'<span><strong>'+esc(team.stadium)+'</strong><small>'+esc(team.name)+'</small></span><span aria-hidden="true">→</span></a>').join(""):'<div class="standings-empty" role="status"><h3>Estadios pendientes de publicar</h3><p>Los estadios oficiales aparecerán aquí cuando los clubes confirmen sus datos.</p><a class="text-link" href="equipos.html">Consultar clubes →</a></div>';
  }
  if(!input||!results)return;
  const index=[
    ...teams.map(team=>({kind:"Club",title:team.name||"Club sin nombre",detail:[team.competition==="d1"?"División 1":team.competition==="d2"?"División 2":"",team.stadium||""].filter(Boolean).join(" · "),url:"equipos.html?id="+encodeURIComponent(team.id),search:[team.name,team.competition,team.stadium,team.description].join(" ")})),
    ...matches.map(match=>({kind:"Partido",title:teamName(match.homeTeamId)+" vs "+teamName(match.awayTeamId),detail:[match.competition==="d1"?"División 1":match.competition==="d2"?"División 2":match.competition==="copa"?"Copa IFL":"Competición",match.round||"",match.date||"",match.status||""].filter(Boolean).join(" · "),url:"calendario.html",search:[teamName(match.homeTeamId),teamName(match.awayTeamId),match.competition,match.round,match.date,match.stadium,match.status].join(" ")})),
    ...news.map(item=>({kind:"Noticia",title:item.title||"Comunicado oficial",detail:[item.category||"Comunicado oficial",item.date||""].filter(Boolean).join(" · "),url:"noticias.html?id="+encodeURIComponent(item.id),search:[item.title,item.category,item.summary,item.content].join(" ")}))
  ];
  function render(){
    const query=input.value.trim().toLocaleLowerCase("es");
    if(!query){results.innerHTML='<p class="muted-copy">Escribe para buscar clubes, partidos o noticias oficiales.</p>';return;}
    const found=index.filter(item=>item.search.toLocaleLowerCase("es").includes(query)).slice(0,12);
    results.innerHTML=found.length?found.map(item=>'<a class="ifl-search-result" href="'+esc(item.url)+'"><span class="ifl-search-result__kind">'+esc(item.kind)+'</span><span><strong>'+esc(item.title)+'</strong><small>'+esc(item.detail)+'</small></span><span aria-hidden="true">→</span></a>').join(""):'<div class="standings-empty" role="status"><h3>Sin resultados</h3><p>No hay contenido oficial publicado que coincida con esa búsqueda.</p></div>';
  }
  input.addEventListener("input",render);
})();
