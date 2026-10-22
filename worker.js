import { onRequestGet as startRobloxOAuth } from "./functions/api/roblox/oauth/start.js";
import { onRequestGet as finishRobloxOAuth } from "./functions/api/roblox/oauth/callback.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/roblox/oauth/start") {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }
      return startRobloxOAuth({ request, env });
    }

    if (url.pathname === "/api/roblox/oauth/callback") {
      if (request.method !== "GET") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }
      return finishRobloxOAuth({ request, env });
    }

    return env.ASSETS.fetch(request);
  },
};
