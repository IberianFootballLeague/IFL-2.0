(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const storageKey = "ifl-2-discord-session";
  const robloxKey = "ifl-2-roblox-profile";
  let session = null;
  try { session = JSON.parse(localStorage.getItem(storageKey) || "null"); } catch (_) {}

  function showStatus(message, error = false) {
    const status = $("roblox-connect-status");
    if (!status) return;
    status.hidden = !message;
    status.textContent = message || "";
    status.style.color = error ? "#c43d3d" : "";
  }
  function getDiscordName(user) {
    return user?.user_metadata?.global_name || user?.user_metadata?.full_name ||
      user?.user_metadata?.name || user?.user_metadata?.preferred_username || "Usuario de Discord";
  }
  function renderDiscord(user) {
    const name = getDiscordName(user);
    const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
    $("profile-card-title").textContent = user ? name : "Inicia sesión con Discord";
    $("profile-discord-name").textContent = user ? name : "No conectado";
    $("profile-session-status").textContent = user ? "Sesión de Discord activa" : "Sesión no iniciada";
    if (avatar && /^https:\/\//i.test(avatar)) {
      $("profile-discord-avatar").src = avatar;
      $("profile-discord-avatar").hidden = false;
      $("profile-discord-fallback").hidden = true;
    } else {
      $("profile-discord-avatar").hidden = true;
      $("profile-discord-fallback").hidden = false;
    }
    const button = $("roblox-connect-button");
    button.disabled = !user;
    if (!user) button.textContent = "Inicia sesión primero";
    else if (!document.querySelector("#profile-roblox-row").hidden) button.textContent = "Roblox conectado";
    else button.textContent = "Conectar Roblox";
  }
  function renderRoblox(profile) {
    const connected = Boolean(profile && (profile.id || profile.userId) && (profile.username || profile.displayName));
    $("profile-roblox-row").hidden = !connected;
    $("technical-connect-prompt").hidden = connected;
    $("avatar-3d-badge").textContent = connected ? "CONECTADO" : "SIN CONECTAR";
    if (!connected) {
      $("profile-roblox-model").hidden = true;
      $("profile-roblox-avatar").hidden = true;
      $("avatar-3d-placeholder").hidden = false;
      return;
    }
    const name = profile.username || profile.displayName;
    $("profile-roblox-name").textContent = "@" + name;
    $("avatar-3d-placeholder").hidden = true;
    $("profile-roblox-model").hidden = true;
    const avatar = $("profile-roblox-avatar");
    if (profile.picture && /^https:\/\//i.test(profile.picture)) {
      avatar.src = profile.picture;
      avatar.hidden = false;
    } else avatar.hidden = true;
    $("roblox-connect-button").textContent = "Roblox conectado";
    loadAvatarModel(profile);
  }
  async function loadAvatarModel(profile) {
    const userId = profile.id || profile.userId;
    if (!/^\d+$/.test(String(userId || ""))) {
      $("avatar-3d-tip").textContent = "El avatar se ha vinculado, pero Roblox no ha devuelto un ID numérico para cargar el modelo 3D.";
      return;
    }
    try {
      // El endpoint 3D de Roblox es experimental; si el modelo no se puede cargar,
      // mantenemos la miniatura de alta calidad como alternativa.
      $("profile-roblox-model").hidden = false;
      window.dispatchEvent(new CustomEvent("ifl-roblox-avatar-load", { detail: { userId: String(userId) } }));
      $("profile-roblox-avatar").hidden = true;
      $("avatar-3d-tip").textContent = "Arrastra el avatar para girarlo y usa la rueda del ratón para acercar o alejar.";
    } catch (error) {
      $("avatar-3d-tip").textContent = "No se pudo cargar el modelo 3D en este momento. Se muestra la miniatura del avatar si está disponible.";
      if ($("profile-roblox-avatar").src) $("profile-roblox-avatar").hidden = false;
      console.warn("[IFL] No se pudo cargar el avatar 3D:", error);
    }
  }
  function readRoblox() {
    try { return JSON.parse(localStorage.getItem(robloxKey) || "null"); } catch (_) { return null; }
  }
  function connectRoblox() {
    if (!session?.access_token) {
      showStatus("Primero inicia sesión con Discord.", true);
      return;
    }
    // La ruta OAuth requiere funciones de servidor y credenciales privadas de Roblox.
    const popup = window.open("/api/roblox/oauth/start", "ifl-roblox-oauth", "popup,width=520,height=720,resizable=yes,scrollbars=yes");
    if (!popup) {
      showStatus("El navegador ha bloqueado la ventana emergente. Permite ventanas emergentes para la IFL.", true);
      return;
    }
    const button = $("roblox-connect-button");
    button.disabled = true;
    button.textContent = "Esperando a Roblox…";
    showStatus("Autoriza la conexión en la ventana de Roblox.");
    const watcher = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(watcher);
        if (button.textContent === "Esperando a Roblox…") {
          button.disabled = false;
          button.textContent = "Conectar Roblox";
        }
      }
    }, 500);
  }
  function onOAuthMessage(event) {
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
    showStatus("Conectado como @" + (data.profile.username || data.profile.displayName || "Roblox") + ".");
  }
  renderDiscord(session?.user || null);
  renderRoblox(readRoblox());
  window.addEventListener("ifl-auth-state", (event) => {
    session = { ...(session || {}), user: event.detail?.user || null };
    renderDiscord(session.user);
  });
  window.addEventListener("message", onOAuthMessage);
  $("roblox-connect-button").addEventListener("click", connectRoblox);
})();