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
  const menus = [...document.querySelectorAll("details.profile-menu, details.mobile-menu")];
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
    if (prefs.compact) document.documentElement.classList.add("ifl-compact");
    if (prefs.largeText) document.documentElement.classList.add("ifl-large-text");
    if (prefs.accent && /^#[0-9a-f]{6}$/i.test(prefs.accent)) document.documentElement.style.setProperty("--color-brand", prefs.accent);
  } catch (_) {}
})();