/* Datos locales de la IFL. Añade aquí únicamente información oficial confirmada.
   No requiere APIs ni dependencias externas. */
window.IFL_DATA = Object.freeze({
  teams: [],
  players: [],
  matches: [],
  news: [],
  // Movimientos oficiales confirmados. Campos sugeridos: id, playerName, fromTeam, toTeam, fromTeamLogo, toTeamLogo, type, fee, date, status.
  transfers: [],
  // Registros oficiales de palmarés. Campos sugeridos: team, teamName, club, title, competition, season, year, date.
  honours: [],
  // Publica solo estadios oficiales confirmados. Campos sugeridos: id, name, teamId, teamName, competition, city, capacity, year, surface, dimensions, image, latitude, longitude.
  stadiums: [],
  // La tabla se calcula a partir de partidos finalizados de D1 y D2.
  // Copa IFL utiliza matches con competition: "copa" y campos round/status.
  playerOfRound: null
});
