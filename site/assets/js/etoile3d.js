// Étoile 3D du logo : l'étoile tourne lentement sur elle-même, au-dessus du « M » (image plate, nette).
// WebGL écrit à la main, sans bibliothèque.
// - « Réduire les animations » (système ou panneau Accessibilité) : étoile immobile.
// - Pas de WebGL, ou erreur : l'étoile plate (dessin SVG dans la page) reste affichée.
// - Le calcul s'arrête quand l'étoile n'est plus visible ou que l'onglet est en arrière-plan.
(() => {
  const boite = document.querySelector("[data-etoile3d]");
  if (!boite) return;
  const root = document.documentElement;
  const reduit = () => root.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "etoile3d-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let gl = null;
  try {
    gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
  } catch { gl = null; }
  if (!gl) return;

  // ---------- Forme : le contour exact de l'étoile du logo (courbes de Bézier), légèrement bombé ----------
  // Centre (862, 117), branches de 96 unités : on ramène tout à un rayon de 1.
  const COURBES = [
    [[862, 18], [868, 80], [890, 108], [958, 117]],
    [[958, 117], [890, 126], [868, 150], [862, 214]],
    [[862, 214], [856, 150], [834, 126], [768, 117]],
    [[768, 117], [834, 108], [856, 80], [862, 18]],
  ];
  const bezier = (p, t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
  };
  const contour = [];
  for (const c of COURBES) for (let i = 0; i < 18; i++) {
    const [x, y] = bezier(c, i / 18);
    contour.push([(x - 862) / 97, (117 - y) / 97]);
  }
  const BOMBE = .16;
  const pos = [0, 0, BOMBE];
  const nor = [0, 0, 1];
  for (const [x, y] of contour) {
    const l = Math.hypot(x, y) || 1;
    pos.push(x, y, 0);
    const n = [x / l * .55, y / l * .55, .83];
    const ln = Math.hypot(...n);
    nor.push(n[0] / ln, n[1] / ln, n[2] / ln);
  }
  const idx = [];
  for (let k = 0; k < contour.length; k++) idx.push(0, 1 + k, 1 + ((k + 1) % contour.length));

  // ---------- WebGL ----------
  const VS = `
    attribute vec3 aPos; attribute vec3 aNor;
    uniform mat4 uProj; uniform mat4 uVue;
    varying vec3 vN; varying vec3 vP;
    void main() {
      vec4 p = uVue * vec4(aPos, 1.0);
      vP = p.xyz; vN = mat3(uVue) * aNor;
      gl_Position = uProj * p;
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vN; varying vec3 vP;
    uniform vec3 uCouleur; uniform float uAlpha; uniform float uClair;
    void main() {
      vec3 n = normalize(vN);
      if (!gl_FrontFacing) n = -n;
      vec3 v = normalize(-vP);
      vec3 l1 = normalize(vec3(-.55, .75, .9));
      vec3 l2 = normalize(vec3(.8, -.2, .5));
      float d1 = max(dot(n, l1), 0.0);
      float d2 = max(dot(n, l2), 0.0);
      float s1 = pow(max(dot(n, normalize(l1 + v)), 0.0), 60.0);
      vec3 c = uCouleur * (.62 + .38 * d1 + .14 * d2);
      c += vec3(1.0) * s1 * (.5 - .25 * uClair);
      gl_FragColor = vec4(c * uAlpha, uAlpha);
    }`;
  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
  } catch { return; }
  gl.useProgram(prog);

  const tampon = (donnees, cible = gl.ARRAY_BUFFER, Type = Float32Array) => {
    const b = gl.createBuffer();
    gl.bindBuffer(cible, b);
    gl.bufferData(cible, new Type(donnees), gl.STATIC_DRAW);
    return b;
  };
  const bPos = tampon(pos), bNor = tampon(nor), bIdx = tampon(idx, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);
  const aPos = gl.getAttribLocation(prog, "aPos"), aNor = gl.getAttribLocation(prog, "aNor");
  gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, bNor); gl.enableVertexAttribArray(aNor); gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bIdx);
  const U = { proj: gl.getUniformLocation(prog, "uProj"), vue: gl.getUniformLocation(prog, "uVue"), couleur: gl.getUniformLocation(prog, "uCouleur"), alpha: gl.getUniformLocation(prog, "uAlpha"), clair: gl.getUniformLocation(prog, "uClair") };

  // Matrices 4×4 (colonnes).
  const perspective = (fov, pr, lo) => {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (pr - lo);
    return new Float32Array([f, 0, 0, 0, 0, f, 0, 0, 0, 0, (lo + pr) * nf, -1, 0, 0, 2 * lo * pr * nf, 0]);
  };
  const vueEtoile = (angle, echelle, dist) => {
    const c = Math.cos(angle) * echelle, s = Math.sin(angle) * echelle;
    return new Float32Array([c, 0, -s, 0, 0, echelle, 0, 0, s, 0, c, 0, 0, 0, -dist, 1]);
  };

  const FOV = 30 * Math.PI / 180;
  const MARGE = 1.45; // la boîte est plus grande que l'étoile : la rotation ne la coupe jamais
  const DIST = MARGE / Math.tan(FOV / 2);
  const etat = { debut: 0, boucle: 0, visible: true };

  function dimensionner() {
    const r = boite.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const t = Math.max(1, Math.round(Math.min(r.width, r.height) * dpr));
    if (canvas.width !== t) { canvas.width = t; canvas.height = t; }
    gl.viewport(0, 0, t, t);
  }

  function dessiner(temps) {
    const anime = !reduit();
    if (!etat.debut) etat.debut = temps;
    const t = (temps - etat.debut) / 1000;
    // Apparition : petite montée en taille (0,7 s, après l'arrivée du logo), puis rotation continue.
    const x = anime ? Math.min(1, Math.max(0, (t - .35) / .7)) : 1;
    const apparition = 1 - Math.pow(1 - x, 3);
    const echelle = .72 + .28 * apparition;
    const angle = anime ? t * .8 : .35;
    const clair = root.dataset.theme === "light" && root.dataset.contrast !== "high";
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniformMatrix4fv(U.proj, false, perspective(FOV, .1, 50));
    gl.uniformMatrix4fv(U.vue, false, vueEtoile(angle, echelle, DIST));
    gl.uniform3fv(U.couleur, clair ? [.184, .486, .941] : [.933, .949, .973]);
    gl.uniform1f(U.alpha, apparition);
    gl.uniform1f(U.clair, clair ? 1 : 0);
    gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
  }

  function image(temps) {
    etat.boucle = 0;
    if (!etat.visible || document.hidden) return;
    dessiner(temps);
    if (!reduit()) etat.boucle = requestAnimationFrame(image);
  }
  const relancer = () => { if (!etat.boucle) etat.boucle = requestAnimationFrame(image); };

  new ResizeObserver(() => { dimensionner(); relancer(); }).observe(boite);
  new IntersectionObserver((e) => { etat.visible = e.some((v) => v.isIntersecting); relancer(); }).observe(boite);
  document.addEventListener("visibilitychange", relancer);
  new MutationObserver(relancer).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion", "data-contrast"] });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); boite.classList.remove("pret"); canvas.remove(); });

  boite.append(canvas);
  dimensionner();
  try {
    dessiner(performance.now());
  } catch {
    canvas.remove();
    return;
  }
  boite.classList.add("pret");
  relancer();
})();
