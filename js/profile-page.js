(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const storageKey = "ifl-2-discord-session";
  const robloxKey = "ifl-2-roblox-profile";
  function showStatus(message, error = false) {
    const status = $("roblox-connect-status");
    if (!status) return;
    status.hidden = !message;
    status.textContent = message || "";
    status.style.color = error ? "#c43d3d" : "";
  }
  function renderDiscord(user) {
    const name = user?.user_metadata?.global_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.preferred_username || "Usuario de Discord";
    const id = user?.id || "";
    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
    $("profile-card-title").textContent = user ? name : "Inicia sesión con Discord";
    $("profile-discord-id").textContent = id ? "ID de Discord: " + id : "Inicia sesión para ver los datos de tu cuenta.";
    $("profile-session-status").textContent = user ? "Sesión de Discord activa" : "Sesión no iniciada";
    if (avatar) {
      $("profile-discord-avatar").src = avatar;
      $("profile-discord-avatar").hidden = false;
      $("profile-discord-fallback").hidden = true;
    } else {
      $("profile-discord-avatar").hidden = true;
      $("profile-discord-fallback").hidden = false;
    }
    $("roblox-connect-button").disabled = !user;
    if (!user) $("roblox-connect-button").textContent = "Inicia sesión primero";
    else if (!$("profile-roblox-name").dataset.connected) $("roblox-connect-button").textContent = "Conectar Roblox";
  }
  function renderRoblox(profile) {
    if (!profile) return;
    const name = profile.username || profile.displayName || "Cuenta de Roblox";
    $("profile-roblox-name").textContent = "@" + name;
    $("profile-roblox-description").textContent = "Cuenta de Roblox vinculada en este navegador.";
    $("profile-roblox-name").dataset.connected = "true";
    $("roblox-connect-button").textContent = "Roblox conectado";
    if (profile.picture) {
      $("profile-roblox-avatar").src = profile.picture;
      $("profile-roblox-avatar").hidden = false;
      $("profile-roblox-fallback").hidden = true;
    }
    showStatus("Conectado como @" + name + ".");
  }
  let session = null;
  try { session = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch (_) {}
  renderDiscord(session?.user || null);
  try { renderRoblox(JSON.parse(localStorage.getItem(robloxKey) || "null")); } catch (_) {}
  window.addEventListener("ifl-auth-state", (event) => renderDiscord(event.detail?.user || null));
  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin || event.data?.source !== "ifl-roblox-oauth") return;
    const data = event.data;
    const button = $("roblox-connect-button");
    button.disabled = false;
    if (!data.ok || !data.profile) {
      showStatus(data.error || "No se pudo conectar Roblox.", true);
      button.textContent = "Reintentar conexión";
      return;
    }
    try { localStorage.setItem(robloxKey, JSON.stringify(data.profile)); } catch (_) {}
    renderRoblox(data.profile);
  });
  $("roblox-connect-button").addEventListener("click", () => {
    if (!session?.access_token) {
      showStatus("Primero inicia sesión con Discord.", true);
      return;
    }
    const popup = window.open("/api/roblox/oauth/start", "ifl-roblox-oauth", "popup,width=520,height=720,resizable=yes,scrollbars=yes");
    if (!popup) {
      showStatus("El navegador ha bloqueado la ventana emergente. Permite ventanas emergentes para la IFL.", true);
      return;
    }
    $("roblox-connect-button").disabled = true;
    $("roblox-connect-button").textContent = "Esperando a Roblox…";
    showStatus("Autoriza la conexión en la ventana de Roblox.");
    const watcher = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(watcher);
        if ($("roblox-connect-button").textContent === "Esperando a Roblox…") {
          $("roblox-connect-button").disabled = false;
          $("roblox-connect-button").textContent = "Conectar Roblox";
          showStatus("");
        }
      }
    }, 500);
  });
})();