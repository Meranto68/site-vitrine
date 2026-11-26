// Comportements communs : thème, accessibilité, menu, comparateur avant/après, scène 3D des appareils.
(() => {
  const root = document.documentElement;
  const $ = (id) => document.getElementById(id);
  const animationsReduites = () => root.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    majScenes();
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
    majScenes();
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
  // Bascule ordinateur / téléphone (page Réalisation).
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

  // ---------- Scène 3D : ordinateur et téléphone ----------
  // L'écran défile au rythme de la page ; la scène s'incline vers la souris. Rien ne bouge si les animations sont réduites.
  const scenes = [...document.querySelectorAll("[data-scene]")];

  // Bascule Avant / Après (accueil) : elle pilote la scène de la même section.
  for (const bouton of document.querySelectorAll("[data-version]:not([data-scene])")) {
    bouton.addEventListener("click", () => {
      const section = bouton.closest("section");
      const scene = section && section.querySelector("[data-scene]");
      if (!scene) return;
      scene.dataset.version = bouton.dataset.version;
      for (const b of section.querySelectorAll("button[data-version]")) b.setAttribute("aria-pressed", String(b === bouton));
    });
  }

  // Avancement : 0 quand la scène est entièrement visible (ou à l'ouverture de la page), 1 quand elle sort par le haut.
  const avancementBrut = (r, h) => (h * .92 - r.bottom) / (h * .8);
  const depart = new Map(scenes.map((s) => [s, Math.max(0, avancementBrut(s.getBoundingClientRect(), window.innerHeight))]));
  let attente = 0;
  function majScenes() {
    attente = 0;
    const h = window.innerHeight;
    for (const scene of scenes) {
      if (animationsReduites()) {
        scene.style.setProperty("--defil", "0");
        scene.style.removeProperty("--rx");
        scene.style.removeProperty("--ry");
        continue;
      }
      const r = scene.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) continue;
      const d = depart.get(scene) || 0;
      const p = Math.min(1, Math.max(0, (avancementBrut(r, h) - d) / (1 - d)));
      scene.style.setProperty("--defil", (p * p * (3 - 2 * p)).toFixed(4));
    }
  }
  const demander = () => { if (!attente) attente = requestAnimationFrame(majScenes); };
  if (scenes.length) {
    window.addEventListener("scroll", demander, { passive: true });
    window.addEventListener("resize", demander, { passive: true });
    majScenes();
  }

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    for (const scene of scenes) {
      scene.addEventListener("pointermove", (e) => {
        if (animationsReduites()) return;
        const r = scene.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        scene.style.setProperty("--ry", `${(-17 + x * 18).toFixed(2)}deg`);
        scene.style.setProperty("--rx", `${(9 - y * 10).toFixed(2)}deg`);
      });
      scene.addEventListener("pointerleave", () => {
        scene.style.removeProperty("--rx");
        scene.style.removeProperty("--ry");
      });
    }
  }
})();
