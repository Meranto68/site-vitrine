(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const accessToggle = document.getElementById('accessToggle');
  const accessPanel = document.getElementById('accessPanel');
  const highContrast = document.getElementById('highContrast');
  const spaciousText = document.getElementById('spaciousText');
  const reduceMotion = document.getElementById('reduceMotion');
  const sizeValue = document.getElementById('textSizeValue');
  let textScale = 100;

  const readPrefs = () => {
    try { return JSON.parse(localStorage.getItem('meranto-preferences') || '{}'); }
    catch { return {}; }
  };
  const savePrefs = () => {
    try {
      localStorage.setItem('meranto-preferences', JSON.stringify({
        theme: root.dataset.theme,
        contrast: root.dataset.contrast,
        scale: textScale,
        spacious: spaciousText.checked,
        reduceMotion: reduceMotion.checked
      }));
    } catch { /* Le site reste utilisable si le stockage local est indisponible. */ }
  };
  const prefs = readPrefs();
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = prefs.theme === 'light' || prefs.theme === 'dark' ? prefs.theme : (systemDark ? 'dark' : 'light');
  root.dataset.contrast = prefs.contrast === 'high' ? 'high' : 'normal';
  textScale = Number.isFinite(prefs.scale) ? Math.min(200, Math.max(100, prefs.scale)) : 100;
  highContrast.checked = root.dataset.contrast === 'high';
  spaciousText.checked = Boolean(prefs.spacious);
  reduceMotion.checked = Boolean(prefs.reduceMotion);

  function applyText() {
    root.style.setProperty('--user-scale', String(textScale / 100));
    root.style.setProperty('--user-leading', spaciousText.checked ? '1.9' : '1.65');
    root.style.setProperty('--user-letter-spacing', spaciousText.checked ? '.025em' : '0');
    sizeValue.value = `${textScale} %`;
    sizeValue.textContent = `${textScale} %`;
  }
  function updateThemeLabel() {
    const next = root.dataset.theme === 'dark' ? 'clair' : 'sombre';
    themeToggle.setAttribute('aria-label', `Activer le thème ${next}`);
    themeToggle.title = `Activer le thème ${next}`;
  }
  applyText(); updateThemeLabel();
  if (reduceMotion.checked) root.dataset.motion = 'reduce';

  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    updateThemeLabel(); savePrefs();
  });
  accessToggle.addEventListener('click', () => {
    const open = accessToggle.getAttribute('aria-expanded') === 'true';
    accessToggle.setAttribute('aria-expanded', String(!open));
    accessPanel.hidden = open;
    if (!open) document.getElementById('accessTitle').focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && accessToggle.getAttribute('aria-expanded') === 'true') {
      accessPanel.hidden = true;
      accessToggle.setAttribute('aria-expanded', 'false');
      accessToggle.focus();
    }
  });
  document.getElementById('increaseText').addEventListener('click', () => { textScale = Math.min(200, textScale + 10); applyText(); savePrefs(); });
  document.getElementById('decreaseText').addEventListener('click', () => { textScale = Math.max(100, textScale - 10); applyText(); savePrefs(); });
  highContrast.addEventListener('change', () => { root.dataset.contrast = highContrast.checked ? 'high' : 'normal'; savePrefs(); });
  spaciousText.addEventListener('change', () => { applyText(); savePrefs(); });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.checked) root.dataset.motion = 'reduce'; else delete root.dataset.motion; savePrefs(); });
  document.getElementById('resetAccess').addEventListener('click', () => {
    textScale = 100; root.dataset.contrast = 'normal'; highContrast.checked = false;
    spaciousText.checked = false; reduceMotion.checked = false; delete root.dataset.motion;
    applyText(); savePrefs();
  });
})();
