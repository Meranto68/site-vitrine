// Comportements communs : thème, accessibilité, menu, comparateur avant/après, animation de la carte de suivi.
(() => {
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);

  // ---------- Préférences (thème et accessibilité) ----------
  const themeToggle = $("themeToggle");
  const accessToggle = $("accessToggle");
  const accessPanel = $("accessPanel");
  const highContrast = $("highContrast");
  const spaciousText = $("spaciousText");
  const reduceMotion = $("reduceMotion");
  const sizeValue = $("textSizeValue");
  let prefs = {};
  try { prefs = JSON.parse(localStorage.getItem("meranto-preferences") || "{}"); } catch { prefs = {}; }
  let textScale = Number.isFinite(prefs.scale) ? Math.min(200, Math.max(100, prefs.scale)) : 100;
  highContrast.checked = root.dataset.contrast === "high";
  spaciousText.checked = Boolean(prefs.spacious);
  reduceMotion.checked = Boolean(prefs.reduceMotion);

  const savePrefs = () => {
    try {
      localStorage.setItem("meranto-preferences", JSON.stringify({
        theme: root.dataset.theme, contrast: root.dataset.contrast, scale: textScale,
        spacious: spaciousText.checked, reduceMotion: reduceMotion.checked,
      }));
    } catch { /* Stockage indisponible : le site reste utilisable, sans mémoriser les choix. */ }
  };
  const applyText = () => {
    root.style.setProperty("--user-scale", String(textScale / 100));
    root.style.setProperty("--user-leading", spaciousText.checked ? "1.9" : "1.65");
    root.style.setProperty("--user-letter-spacing", spaciousText.checked ? ".025em" : "0");
    sizeValue.textContent = `${textScale} %`;
  };
  const updateThemeLabel = () => {
    const suivant = root.dataset.theme === "dark" ? "clair" : "sombre";
    themeToggle.setAttribute("aria-label", `Activer le thème ${suivant}`);
    themeToggle.title = `Activer le thème ${suivant}`;
  };
  applyText();
  updateThemeLabel();

  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    updateThemeLabel();
    savePrefs();
  });
  accessToggle.addEventListener("click", () => {
    const ouvert = accessToggle.getAttribute("aria-expanded") === "true";
    accessToggle.setAttribute("aria-expanded", String(!ouvert));
    accessPanel.hidden = ouvert;
    if (!ouvert) $("accessTitle").focus();
  });
  $("increaseText").addEventListener("click", () => { textScale = Math.min(200, textScale + 10); applyText(); savePrefs(); });
  $("decreaseText").addEventListener("click", () => { textScale = Math.max(100, textScale - 10); applyText(); savePrefs(); });
  highContrast.addEventListener("change", () => { root.dataset.contrast = highContrast.checked ? "high" : "normal"; savePrefs(); });
  spaciousText.addEventListener("change", () => { applyText(); savePrefs(); });
  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.checked) root.dataset.motion = "reduce"; else delete root.dataset.motion;
    savePrefs();
  });
  $("resetAccess").addEventListener("click", () => {
    textScale = 100;
    root.dataset.contrast = "normal";
    highContrast.checked = false;
    spaciousText.checked = false;
    reduceMotion.checked = false;
    delete root.dataset.motion;
    applyText();
    savePrefs();
  });

  // ---------- Menu sur petit écran ----------
  const menuToggle = $("menuToggle");
  const menu = $("menuPrincipal");
  const fermerMenu = () => { menuToggle.setAttribute("aria-expanded", "false"); menu.classList.remove("ouvert"); };
  menuToggle.addEventListener("click", () => {
    const ouvert = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!ouvert));
    menu.classList.toggle("ouvert", !ouvert);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (accessToggle.getAttribute("aria-expanded") === "true") {
      accessPanel.hidden = true;
      accessToggle.setAttribute("aria-expanded", "false");
      accessToggle.focus();
    }
    if (menuToggle.getAttribute("aria-expanded") === "true") {
      fermerMenu();
      menuToggle.focus();
    }
  });

  // ---------- Comparateur avant / après ----------
  for (const comp of document.querySelectorAll("[data-comparateur]")) {
    const curseur = comp.querySelector(".comparateur-curseur");
    const maj = () => {
      comp.style.setProperty("--position", `${curseur.value}%`);
      curseur.setAttribute("aria-valuetext", `${curseur.value} % de l'ancien site visible`);
    };
    curseur.addEventListener("input", maj);
    maj();
  }
  // Bascule ordinateur / téléphone (page Exemple).
  for (const bouton of document.querySelectorAll("[data-ecran]")) {
    bouton.addEventListener("click", () => {
      const ecran = bouton.dataset.ecran;
      for (const b of document.querySelectorAll("[data-ecran]")) b.setAttribute("aria-pressed", String(b === bouton));
      for (const comp of document.querySelectorAll("[data-ecran-actif]")) {
        comp.dataset.ecranActif = ecran;
        for (const img of comp.querySelectorAll("img[data-ordinateur]")) {
          img.src = img.dataset[ecran];
          img.alt = img.alt.replace(/sur (ordinateur|téléphone)/, `sur ${ecran === "telephone" ? "téléphone" : "ordinateur"}`);
        }
      }
    });
  }

  // ---------- Carte de suivi : les étapes s'affichent l'une après l'autre ----------
  const animationsReduites = root.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const liste of document.querySelectorAll(".suivi[data-animer]")) {
    if (animationsReduites || !("IntersectionObserver" in window)) continue;
    [...liste.children].forEach((li, i) => li.style.setProperty("--i", String(i)));
    liste.classList.add("en-cours");
    const obs = new IntersectionObserver((entrees) => {
      if (!entrees.some((e) => e.isIntersecting)) return;
      liste.classList.remove("en-cours");
      liste.classList.add("joue");
      obs.disconnect();
    }, { threshold: .3 });
    obs.observe(liste);
  }
})();
