const OAUTH_COOKIE = "ifl_roblox_oauth_state";
function cookieValue(request, name) {
  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
function resultPage(origin, payload, ok) {
  const message = safeJson({ source: "ifl-roblox-oauth", ok, profile: ok ? payload : null, error: ok ? null : payload });
  return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Roblox · IFL</title>
  <meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#11161d;color:#f4f7fb;font:600 16px system-ui}main{max-width:420px;padding:28px;text-align:center;background:#1b222c;border:1px solid #343e4b;border-radius:18px}p{color:#b7c1ce;line-height:1.5}</style></head>
  <body><main><h1>${ok ? "Roblox conectado" : "No se pudo conectar Roblox"}</h1><p>${ok ? "Puedes cerrar esta ventana y volver a la IFL." : "Vuelve a la IFL e inténtalo de nuevo."}</p></main>
  <script>const message=${message};if(window.opener){window.opener.postMessage(message,${JSON.stringify(origin)});setTimeout(()=>window.close(),900);}</script></body></html>`, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }
  });
}
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = url.origin;
  const state = url.searchParams.get("state") || "";
  const code = url.searchParams.get("code") || "";
  const savedState = cookieValue(request, OAUTH_COOKIE);
  if (!state || !savedState || state !== savedState) return resultPage(origin, "La sesión OAuth ha caducado. Vuelve a iniciar la conexión.", false);
  if (url.searchParams.get("error")) return resultPage(origin, "Autorización cancelada en Roblox.", false);
  if (!code || !env.ROBLOX_CLIENT_ID || !env.ROBLOX_CLIENT_SECRET) {
    return resultPage(origin, "Faltan las credenciales OAuth de Roblox en el servidor.", false);
  }
  const redirectUri = origin + "/api/roblox/oauth/callback";
  const tokenResponse = await fetch("https://apis.roblox.com/oauth/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: env.ROBLOX_CLIENT_ID,
      client_secret: env.ROBLOX_CLIENT_SECRET,
      redirect_uri: redirectUri
    })
  });
  if (!tokenResponse.ok) return resultPage(origin, "Roblox rechazó el código de autorización.", false);
  const token = await tokenResponse.json();
  const userResponse = await fetch("https://apis.roblox.com/oauth/v1/userinfo", {
    headers: { Authorization: "Bearer " + token.access_token }
  });
  if (!userResponse.ok) return resultPage(origin, "No se pudo leer el perfil de Roblox.", false);
  const profile = await userResponse.json();
  return resultPage(origin, {
    id: profile.sub || profile.user_id || null,
    username: profile.preferred_username || profile.nickname || null,
    displayName: profile.name || profile.preferred_username || null,
    profileUrl: profile.profile || null,
    picture: profile.picture || null
  }, true);
}
