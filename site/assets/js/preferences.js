// Applique les préférences d'affichage AVANT le premier affichage (pas de flash de thème).
(() => {
  const root = document.documentElement;
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem("meranto-preferences") || "{}"); } catch { prefs = {}; }
  const sombre = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = prefs.theme === "light" || prefs.theme === "dark" ? prefs.theme : (sombre ? "dark" : "light");
  root.dataset.contrast = prefs.contrast === "high" ? "high" : "normal";
  const echelle = Number.isFinite(prefs.scale) ? Math.min(200, Math.max(100, prefs.scale)) : 100;
  root.style.setProperty("--user-scale", String(echelle / 100));
  if (prefs.spacious) {
    root.style.setProperty("--user-leading", "1.9");
    root.style.setProperty("--user-letter-spacing", ".025em");
  }
  if (prefs.reduceMotion) root.dataset.motion = "reduce";
})();
