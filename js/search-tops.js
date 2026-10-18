document.addEventListener("DOMContentLoaded", () => {
  const buttons = [...document.querySelectorAll(".ifl-top-button")];
  const feedback = document.getElementById("ifl-tops-feedback");
  if (!buttons.length || !feedback) return;
  const labels = {
    goleadores: "Máximos goleadores",
    asistencias: "Máximos asistentes",
    partidos: "Más partidos jugados",
    porterias: "Porterías a cero"
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const wasOpen = button.getAttribute("aria-expanded") === "true";
      buttons.forEach((item) => item.setAttribute("aria-expanded", "false"));
      if (wasOpen) {
        feedback.hidden = true;
        feedback.textContent = "";
        return;
      }
      button.setAttribute("aria-expanded", "true");
      feedback.textContent = labels[button.dataset.top] + ": el ranking se publicará cuando estén cargadas las estadísticas oficiales. No mostramos cifras inventadas.";
      feedback.hidden = false;
    });
  });
});