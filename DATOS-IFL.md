# Datos estáticos de la IFL

Los datos de la web se mantienen en `js/ifl-data.js`. La web lee ese archivo local; no se conecta a APIs externas ni requiere un panel de administración.

## Equipos

Cada objeto de `teams` puede tener estos campos:

- `id`: identificador único y estable (texto o número).
- `name`: nombre oficial del club.
- `competition`: `"d1"` o `"d2"`.
- `crest`: ruta relativa a un escudo guardado en el repositorio (opcional).
- `stadium`: nombre oficial del estadio (opcional).
- `description`: descripción oficial (opcional).
- `players`: lista de nombres u objetos de jugador (opcional).

## Partidos

Cada objeto de `matches` puede incluir:

- `id`: identificador único.
- `date`: fecha y hora ISO 8601, por ejemplo `"2026-11-07T19:30:00+01:00"`.
- `competition`: `"d1"`, `"d2"` o `"copa"`.
- `round`: nombre oficial de la jornada o ronda (opcional).
- `homeTeamId` y `awayTeamId`: deben coincidir con IDs de `teams`.
- `homeScore` y `awayScore`: números cuando haya marcador oficial.
- `status`: `"scheduled"`, `"live"`, `"finished"` o `"postponed"`.
- `stadium`: estadio confirmado (opcional).
- `yellowCards`, `redCards`, `streamUrl`: opcionales, solo si hay datos oficiales.

Las clasificaciones de D1 y D2 se calculan automáticamente con los partidos cuyo estado sea `"finished"` y tengan ambos marcadores numéricos. La puntuación usada es 3 puntos por victoria, 1 por empate y 0 por derrota. Si el reglamento oficial contempla desempates distintos, hay que adaptar la ordenación antes de publicar tablas definitivas.

Los partidos de Copa con `competition: "copa"` se agrupan por `round` para construir el cuadro.

## Noticias

Cada noticia puede incluir `id`, `title`, `date` (ISO 8601), `category`, `summary` y `content`. Solo deben añadirse comunicados aprobados por la IFL.

## Jugador de la jornada

`playerOfRound` puede ser `null` o un objeto con `name`, `team` y `round`.

## Importante

El archivo empieza con listas vacías a propósito: no se han añadido clubes, marcadores ni noticias ficticias. Antes de publicar clasificaciones oficiales, confirma que los equipos, resultados y reglas de desempate coinciden con el reglamento de la IFL.
