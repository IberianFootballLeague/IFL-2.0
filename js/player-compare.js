(() => {
  "use strict";
  const firstInput = document.getElementById("compare-player-a");
  const secondInput = document.getElementById("compare-player-b");
  const datalist = document.getElementById("ifl-player-options");
  const button = document.getElementById("compare-players-button");
  const output = document.getElementById("player-compare-results");
  if (!firstInput || !secondInput || !datalist || !button || !output) return;

  const data = window.IFL_DATA || {};
  const players = Array.isArray(data.players) ? data.players : [];
  const teams = Array.isArray(data.teams) ? data.teams : [];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
  const normalize = value => String(value ?? "").trim().toLocaleLowerCase("es");
  const teamName = player => player.team || teams.find(team => String(team.id) === String(player.teamId))?.name || "Club no indicado";
  const statsOf = player => player.stats && typeof player.stats === "object" ? {...player, ...player.stats} : player;
  const fields = [
    {key:"appearances", aliases:["appearances","matches","gamesPlayed","partidos"], label:"Partidos"},
    {key:"goals", aliases:["goals","goles"], label:"Goles"},
    {key:"assists", aliases:["assists","asistencias"], label:"Asistencias"},
    {key:"minutes", aliases:["minutes","minutesPlayed","minutos"], label:"Minutos"},
    {key:"cleanSheets", aliases:["cleanSheets","clean_sheets","porteriasCero"], label:"Porterías a cero"},
    {key:"yellowCards", aliases:["yellowCards","yellow_cards","tarjetasAmarillas"], label:"Amarillas"},
    {key:"redCards", aliases:["redCards","red_cards","tarjetasRojas"], label:"Rojas"}
  ];
  const getStat = (player, field) => {
    const source = statsOf(player);
    for (const key of field.aliases) {
      const value = source[key];
      if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) return Number(value);
    }
    return null;
  };
  const findPlayer = value => players.find(player => normalize(player.name) === normalize(value));
  const empty = (title, message) => {
    output.innerHTML = '<div class="player-compare__empty"><h3>' + esc(title) + '</h3><p>' + esc(message) + '</p></div>';
  };

  datalist.innerHTML = players.map(player => '<option value="' + esc(player.name) + '"></option>').join("");
  if (!players.length) {
    empty("Estadísticas pendientes de cargar", "El comparador ya está preparado, pero todavía no hay fichas de jugadores oficiales en los datos de la IFL. No mostramos estadísticas inventadas.");
  }

  button.addEventListener("click", () => {
    const playerA = findPlayer(firstInput.value);
    const playerB = findPlayer(secondInput.value);
    if (!firstInput.value.trim() || !secondInput.value.trim()) {
      empty("Selecciona dos jugadores", "Escribe o selecciona el nombre de ambos jugadores para compararlos.");
      return;
    }
    if (!playerA || !playerB) {
      empty("No encontramos a uno de los jugadores", "Solo se pueden comparar jugadores incluidos en los datos oficiales de la IFL. Comprueba los nombres o carga las fichas oficiales.");
      return;
    }
    if (String(playerA.id ?? playerA.name) === String(playerB.id ?? playerB.name)) {
      empty("Elige dos jugadores distintos", "Selecciona dos jugadores diferentes para ver la comparación.");
      return;
    }

    const rows = fields.map(field => {
      const a = getStat(playerA, field), b = getStat(playerB, field);
      const hasA = a !== null, hasB = b !== null;
      const betterA = hasA && hasB && (["yellowCards","redCards"].includes(field.key) ? a < b : a > b);
      const betterB = hasA && hasB && (["yellowCards","redCards"].includes(field.key) ? b < a : b > a);
      return '<div class="player-compare__row">' +
        '<div class="player-compare__value' + (betterA ? ' is-better' : '') + '">' + (hasA ? esc(a.toLocaleString("es-ES")) : '—') + '</div>' +
        '<div class="player-compare__stat-name">' + esc(field.label) + '</div>' +
        '<div class="player-compare__value' + (betterB ? ' is-better' : '') + '">' + (hasB ? esc(b.toLocaleString("es-ES")) : '—') + '</div>' +
      '</div>';
    }).join("");

    output.innerHTML = '<div class="player-compare__scoreboard">' +
      '<div class="player-compare__players">' +
        '<div class="player-compare__player"><strong>' + esc(playerA.name) + '</strong><small>' + esc(teamName(playerA)) + '</small></div>' +
        '<div class="player-compare__middle-label">IFL</div>' +
        '<div class="player-compare__player"><strong>' + esc(playerB.name) + '</strong><small>' + esc(teamName(playerB)) + '</small></div>' +
      '</div>' + rows + '</div>' +
      '<p class="player-compare__note">— significa que esa estadística todavía no está disponible. El resaltado verde indica el mejor valor cuando la comparación es posible.</p>';
  });
})();