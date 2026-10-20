const OAUTH_COOKIE = "ifl_roblox_oauth_state";
function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
export async function onRequestGet({ request, env }) {
  const clientId = env.ROBLOX_CLIENT_ID;
  if (!clientId) return new Response("Falta ROBLOX_CLIENT_ID en el servidor.", { status: 503 });
  const origin = new URL(request.url).origin;
  const state = randomState();
  const redirectUri = origin + "/api/roblox/oauth/callback";
  const authorizeUrl = new URL("https://apis.roblox.com/oauth/v1/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "openid profile");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("prompt", "select_account consent");
  authorizeUrl.searchParams.set("state", state);
  const headers = new Headers({ Location: authorizeUrl.toString() });
  headers.append("Set-Cookie", `${OAUTH_COOKIE}=${encodeURIComponent(state)}; Max-Age=600; Path=/api/roblox/oauth; HttpOnly; Secure; SameSite=Lax`);
  return new Response(null, { status: 302, headers });
}
