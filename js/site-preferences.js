(() => {
  "use strict";
  document.querySelectorAll(".profile-menu .profile-option").forEach((item) => {
    const label = item.textContent.trim();
    const destination = label === "Ajustes" ? "ajustes.html" : label === "Mi club" ? "miclub.html" : label === "Mi perfil" ? "perfil.html" : null;
    if (!destination || item.tagName.toLowerCase() === "a") return;
    const link = document.createElement("a");
    link.className = item.className;
    link.href = destination;
    link.innerHTML = item.innerHTML;
    item.replaceWith(link);
  });

  // Mantener la foto de Discord visible también en páginas sin el módulo de autenticación completo.
  try {
    const session = JSON.parse(localStorage.getItem("ifl-2-discord-session") || "null");
    const user = session?.user || session?.profile || {};
    const meta = user.user_metadata || user.raw_user_meta_data || {};
    let avatarUrl = meta.avatar_url || meta.picture || user.avatar_url || "";
    if (!avatarUrl && user.id && user.avatar && /^[0-9a-f]+$/i.test(String(user.avatar))) {
      avatarUrl = "https://cdn.discordapp.com/avatars/" + encodeURIComponent(user.id) + "/" + encodeURIComponent(user.avatar) + ".png?size=128";
    }
    if (typeof avatarUrl === "string" && /^https:\/\//i.test(avatarUrl)) {
      document.querySelectorAll(".profile-avatar").forEach((avatar) => {
        avatar.style.backgroundImage = 'url("' + avatarUrl.replace(/["\\\\]/g, "") + '")';
        avatar.classList.add("has-discord-avatar");
        avatar.setAttribute("aria-label", "Foto de perfil de Discord");
      });
    }
  } catch (_) {}
\n  const menus = [...document.querySelectorAll("details.profile-menu, details.mobile-menu")];
  document.addEventListener("pointerdown", (event) => {
    menus.forEach((menu) => { if (menu.open && !menu.contains(event.target)) menu.open = false; });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") menus.forEach((menu) => { menu.open = false; });
  });
  document.querySelectorAll(".profile-panel a").forEach((link) => link.addEventListener("click", () => {
    menus.forEach((menu) => { menu.open = false; });
  }));
  try {
    const prefs = JSON.parse(localStorage.getItem("ifl-site-preferences") || "{}");
    if (prefs.reduceMotion) document.documentElement.classList.add("ifl-reduce-motion");
    if (prefs.highContrast) document.documentElement.classList.add("ifl-high-contrast");
    if (prefs.underlineLinks) document.documentElement.classList.add("ifl-underline-links");
    if (prefs.compact) document.documentElement.classList.add("ifl-compact");
    if (prefs.largeText) document.documentElement.classList.add("ifl-large-text");
    if (prefs.accent && /^#[0-9a-f]{6}$/i.test(prefs.accent)) document.documentElement.style.setProperty("--color-brand", prefs.accent);
  } catch (_) {}
})();