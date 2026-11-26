// Ruban 3D : le « M » du logo Meranto en relief, dessiné en WebGL, sans aucune bibliothèque (≈ 10 Ko).
// - Il se dessine à l'arrivée, puis suit doucement la souris et le défilement.
// - « Réduire les animations » (système ou panneau Accessibilité) : image figée, aucun mouvement.
// - Pas de WebGL, ou erreur : le logo plat (image de secours dans la page) reste affiché.
// - Le calcul s'arrête quand le ruban n'est plus visible ou que l'onglet est en arrière-plan.
(() => {
  const boite = document.querySelector("[data-ruban3d]");
  if (!boite) return;
  const root = document.documentElement;
  const reduit = () => root.dataset.motion === "reduce" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const canvas = document.createElement("canvas");
  canvas.className = "ruban3d-canvas";
  canvas.setAttribute("aria-hidden", "true");
  let gl = null;
  try {
    gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power" });
  } catch { gl = null; }
  if (!gl) return;

  // ---------- Forme du ruban (repères tirés du logo, en coordonnées du dessin d'origine) ----------
  // [X, Y, profondeur, largeur relative, couleur, torsion en degrés]
  const REPERES = [
    [236, 814, .30, .55, "#1B4FB0", 0],
    [142, 786, .22, .85, "#2159E6", -12],
    [92, 690, .14, 1.00, "#2460EA", -10],
    [104, 560, .08, 1.00, "#3A8EF0", -4],
    [160, 400, .04, 1.00, "#44A8F5", 2],
    [212, 270, .02, .95, "#4DB4F4", 10],
    [268, 214, -.02, .90, "#3FC3F2", 28],
    [334, 252, -.10, .82, "#3FA9E6", 40],
    [392, 402, -.20, .74, "#2C7FD0", 22],
    [378, 566, -.22, .70, "#1F5FBE", 30],
    [326, 716, -.12, .70, "#123F8F", 70],
    [300, 792, .02, .78, "#1B4FB0", 92],
    [372, 792, .16, .92, "#2159E6", 70],
    [478, 652, .22, 1.08, "#44A8F5", 18],
    [578, 468, .18, 1.10, "#63DDF7", 4],
    [650, 286, .10, 1.05, "#7DF3FC", -6],
    [708, 218, .04, 1.00, "#7DF3FC", -20],
    [776, 252, -.02, .95, "#4FD0E8", -34],
    [822, 352, -.04, .90, "#17A9A0", -26],
    [862, 482, .00, .88, "#19CCB5", -10],
    [902, 592, .06, .84, "#1FE0BC", 0],
    [952, 636, .10, .74, "#1FE0BC", 12],
    [1006, 606, .14, .52, "#5CF0D2", 24],
  ];
  const ECHELLE = 330;
  const LARGEUR = .40;
  const EPAISSEUR = .045;
  const PAS = 420;

  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const pts = REPERES.map(([x, y, z]) => [(x - 535) / ECHELLE, (505 - y) / ECHELLE, z]);
  const lerp = (a, b, t) => a + (b - a) * t;

  // Courbe de Catmull-Rom passant par tous les repères.
  function catmull(p0, p1, p2, p3, t) {
    const t2 = t * t, t3 = t2 * t;
    return p1.map((_, k) => .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3));
  }
  const n = pts.length;
  const echant = [];
  for (let i = 0; i <= PAS; i++) {
    const u = i / PAS;
    const f = u * (n - 1);
    const s = Math.min(n - 2, Math.floor(f));
    const t = f - s;
    const p = catmull(pts[Math.max(0, s - 1)], pts[s], pts[s + 1], pts[Math.min(n - 1, s + 2)], t);
    const a = REPERES[s], b = REPERES[s + 1];
    const ca = hex(a[4]), cb = hex(b[4]);
    const lissage = t * t * (3 - 2 * t);
    const fin = Math.min(1, u / .035) * Math.min(1, (1 - u) / .05);
    echant.push({
      p, u,
      w: LARGEUR * lerp(a[3], b[3], lissage) * (.35 + .65 * Math.sqrt(fin)),
      c: ca.map((v, k) => lerp(v, cb[k], lissage)),
      tw: lerp(a[5], b[5], lissage) * Math.PI / 180,
    });
  }

  const sous = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const croix = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norme = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const plus = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

  // Repère local à chaque point : tangente T, direction de la largeur W (tournée autour de T), normale N.
  for (let i = 0; i < echant.length; i++) {
    const e = echant[i];
    const T = norme(sous(echant[Math.min(echant.length - 1, i + 1)].p, echant[Math.max(0, i - 1)].p));
    const W0 = norme(croix(T, [0, 0, 1]));
    const B = croix(T, W0);
    const W = norme(plus(W0.map((v) => v * Math.cos(e.tw)), B, Math.sin(e.tw)));
    e.W = W;
    e.N = norme(croix(W, T));
  }

  // Quatre faces (dessus, dessous, deux tranches), chacune en bande de triangles indexés.
  const pos = [], nor = [], col = [], prog = [], idx = [];
  function bande(coinA, coinB, normale) {
    const base = pos.length / 3;
    for (const e of echant) {
      const A = coinA(e), Bp = coinB(e), Nf = normale(e);
      pos.push(...A, ...Bp);
      nor.push(...Nf, ...Nf);
      col.push(...e.c, ...e.c);
      prog.push(e.u, e.u);
    }
    for (let i = 0; i < echant.length - 1; i++) {
      const a = base + i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const coin = (sw, sn) => (e) => plus(plus(e.p, e.W, sw * e.w / 2), e.N, sn * EPAISSEUR / 2);
  bande(coin(1, 1), coin(-1, 1), (e) => e.N);
  bande(coin(-1, -1), coin(1, -1), (e) => e.N.map((v) => -v));
  bande(coin(1, -1), coin(1, 1), (e) => e.W);
  bande(coin(-1, 1), coin(-1, -1), (e) => e.W.map((v) => -v));

  // Étoile du logo : quatre branches, légèrement bombée.
  const etoile = { pos: [], nor: [], idx: [] };
  {
    const R = .2, r = .045, cx = (862 - 535) / ECHELLE, cy = (505 - 117) / ECHELLE, cz = .05, bombe = .05;
    etoile.pos.push(cx, cy, cz + bombe); etoile.nor.push(0, 0, 1);
    for (let k = 0; k < 8; k++) {
      const ang = Math.PI / 2 + k * Math.PI / 4;
      const rr = k % 2 === 0 ? R : r;
      etoile.pos.push(cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, cz);
      etoile.nor.push(Math.cos(ang) * .5, Math.sin(ang) * .5, .85);
    }
    for (let k = 0; k < 8; k++) etoile.idx.push(0, 1 + k, 1 + ((k + 1) % 8));
  }

  // ---------- WebGL ----------
  const VS = `
    attribute vec3 aPos; attribute vec3 aNor; attribute vec3 aCol; attribute float aProg;
    uniform mat4 uProj; uniform mat4 uVue;
    varying vec3 vN; varying vec3 vP; varying vec3 vC; varying float vT;
    void main() {
      vec4 p = uVue * vec4(aPos, 1.0);
      vP = p.xyz; vN = mat3(uVue) * aNor; vC = aCol; vT = aProg;
      gl_Position = uProj * p;
    }`;
  const FS = `
    precision mediump float;
    varying vec3 vN; varying vec3 vP; varying vec3 vC; varying float vT;
    uniform float uProgres; uniform float uClair; uniform vec3 uCouleur; uniform float uUni; uniform float uAlpha;
    void main() {
      if (vT > uProgres) discard;
      vec3 n = normalize(vN);
      if (!gl_FrontFacing) n = -n;
      vec3 v = normalize(-vP);
      vec3 l1 = normalize(vec3(-.55, .75, .9));
      vec3 l2 = normalize(vec3(.8, -.2, .5));
      float d1 = max(dot(n, l1), 0.0);
      float d2 = max(dot(n, l2), 0.0);
      float s1 = pow(max(dot(n, normalize(l1 + v)), 0.0), 60.0);
      float s2 = pow(max(dot(n, normalize(l2 + v)), 0.0), 18.0);
      float bord = pow(1.0 - max(dot(n, v), 0.0), 3.0);
      vec3 base = mix(vC, uCouleur, uUni);
      // Couleurs du logo gardées vives : beaucoup de lumière propre, un relief discret, des reflets fins.
      vec3 c = base * (.86 + .26 * d1 + .1 * d2 - .14 * (1.0 - d1) * (1.0 - uUni));
      c += vec3(1.0) * s1 * (.42 - .14 * uClair);
      c += vec3(.6, .96, 1.0) * s2 * .14;
      c += vec3(.55, .95, 1.0) * bord * (.16 - .08 * uClair);
      float pointe = smoothstep(uProgres - .035, uProgres, vT) * step(uProgres, .999);
      c = mix(c, vec3(.85, 1.0, 1.0), pointe * .75);
      gl_FragColor = vec4(c * uAlpha, uAlpha);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  }
  let prog3d;
  try {
    prog3d = gl.createProgram();
    gl.attachShader(prog3d, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog3d, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog3d);
    if (!gl.getProgramParameter(prog3d, gl.LINK_STATUS)) throw new Error("link");
  } catch { return; }
  gl.useProgram(prog3d);

  const loc = (nom) => gl.getAttribLocation(prog3d, nom);
  const uni = (nom) => gl.getUniformLocation(prog3d, nom);
  const U = { proj: uni("uProj"), vue: uni("uVue"), progres: uni("uProgres"), clair: uni("uClair"), couleur: uni("uCouleur"), unie: uni("uUni"), alpha: uni("uAlpha") };
  const A = { pos: loc("aPos"), nor: loc("aNor"), col: loc("aCol"), prog: loc("aProg") };

  function tampon(donnees, cible = gl.ARRAY_BUFFER, Type = Float32Array) {
    const b = gl.createBuffer();
    gl.bindBuffer(cible, b);
    gl.bufferData(cible, new Type(donnees), gl.STATIC_DRAW);
    return b;
  }
  const ruban = {
    pos: tampon(pos), nor: tampon(nor), col: tampon(col), prog: tampon(prog),
    idx: tampon(idx, gl.ELEMENT_ARRAY_BUFFER, Uint16Array), nb: idx.length,
  };
  const zeros = new Array(etoile.pos.length).fill(0);
  const etoileGl = {
    pos: tampon(etoile.pos), nor: tampon(etoile.nor), col: tampon(zeros), prog: tampon(zeros.slice(0, etoile.pos.length / 3)),
    idx: tampon(etoile.idx, gl.ELEMENT_ARRAY_BUFFER, Uint16Array), nb: etoile.idx.length,
  };
  function lier(o) {
    const att = [[A.pos, o.pos, 3], [A.nor, o.nor, 3], [A.col, o.col, 3], [A.prog, o.prog, 1]];
    for (const [l, b, taille] of att) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, taille, gl.FLOAT, false, 0, 0);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.idx);
  }

  // ---------- Matrices 4×4 (colonnes) ----------
  const mul = (a, b) => {
    const r = new Float32Array(16);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k];
      r[i * 4 + j] = s;
    }
    return r;
  };
  const perspective = (fov, asp, pr, lo) => {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (pr - lo);
    return new Float32Array([f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (lo + pr) * nf, -1, 0, 0, 2 * lo * pr * nf, 0]);
  };
  const translation = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
  const echelle = (s) => new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
  const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
  const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
  const rotZ = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); };

  // Centre et taille de la forme, pour la cadrer quel que soit l'écran.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    minX = Math.min(minX, pos[i]); maxX = Math.max(maxX, pos[i]);
    minY = Math.min(minY, pos[i + 1]); maxY = Math.max(maxY, pos[i + 1]);
  }
  maxY = Math.max(maxY, (505 - 117 + 66) / ECHELLE);
  const centre = [(minX + maxX) / 2, (minY + maxY) / 2];
  const demiL = (maxX - minX) / 2, demiH = (maxY - minY) / 2;

  // ---------- État et rendu ----------
  const etat = { progres: reduit() ? 1 : 0, debut: 0, rx: 0, ry: 0, cx: 0, cy: 0, defil: 0, visible: true, boucle: 0, t0: performance.now() };
  let largeur = 0, hauteur = 0, rapport = 1;

  function dimensionner() {
    const r = boite.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, r.width < 600 ? 1.5 : 2);
    largeur = Math.max(1, Math.round(r.width * dpr));
    hauteur = Math.max(1, Math.round(r.height * dpr));
    rapport = r.width / Math.max(1, r.height);
    if (canvas.width !== largeur || canvas.height !== hauteur) {
      canvas.width = largeur;
      canvas.height = hauteur;
    }
    gl.viewport(0, 0, largeur, hauteur);
  }

  function dessiner(temps) {
    const t = (temps - etat.t0) / 1000;
    const anime = !reduit();
    const clair = root.dataset.theme === "light" ? 1 : 0;
    const fov = 32 * Math.PI / 180;
    const dist = 6;
    const vueH = 2 * dist * Math.tan(fov / 2);
    const s = Math.min(vueH * .86 / (2 * demiH), vueH * rapport * .9 / (2 * demiL));
    const respire = anime ? Math.sin(t * .55) : 0;

    const ry = -.32 + etat.cy * .42 + (anime ? Math.sin(t * .3) * .1 : 0) + etat.defil * .7;
    const rx = .1 + etat.cx * -.22 + etat.defil * .25;
    let vue = translation(-centre[0], -centre[1], 0);
    vue = mul(echelle(s), vue);
    vue = mul(rotZ(.05), vue);
    vue = mul(rotX(rx), vue);
    vue = mul(rotY(ry), vue);
    vue = mul(translation(0, respire * .05 + etat.defil * .5, -dist), vue);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.uniformMatrix4fv(U.proj, false, perspective(fov, rapport, .1, 50));
    gl.uniformMatrix4fv(U.vue, false, vue);
    gl.uniform1f(U.clair, clair);
    gl.uniform1f(U.alpha, 1);
    gl.uniform1f(U.unie, 0);
    gl.uniform3fv(U.couleur, [0, 0, 0]);
    gl.uniform1f(U.progres, etat.progres);
    lier(ruban);
    gl.drawElements(gl.TRIANGLES, ruban.nb, gl.UNSIGNED_SHORT, 0);

    // L'étoile apparaît quand le ruban est dessiné, et pivote lentement sur elle-même.
    const apparition = Math.min(1, Math.max(0, (etat.progres - .92) / .08));
    if (apparition > 0) {
      const cx = (862 - 535) / ECHELLE, cy = (505 - 117) / ECHELLE;
      const tour = anime ? t * .8 : .35;
      let ve = mul(translation(cx, cy, 0), mul(rotY(tour), translation(-cx, -cy, 0)));
      ve = mul(vue, ve);
      gl.uniformMatrix4fv(U.vue, false, ve);
      gl.uniform1f(U.progres, 2);
      gl.uniform1f(U.unie, 1);
      gl.uniform3fv(U.couleur, clair ? [.18, .49, .94] : [.93, .95, .97]);
      gl.uniform1f(U.alpha, apparition);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      lier(etoileGl);
      gl.drawElements(gl.TRIANGLES, etoileGl.nb, gl.UNSIGNED_SHORT, 0);
      gl.disable(gl.BLEND);
    }
  }

  function image(temps) {
    etat.boucle = 0;
    if (!etat.visible || document.hidden) return;
    const anime = !reduit();
    if (anime) {
      if (!etat.debut) etat.debut = temps;
      const x = Math.min(1, (temps - etat.debut) / 1700);
      etat.progres = 1 - Math.pow(1 - x, 3);
      etat.cx += (etat.rx - etat.cx) * .06;
      etat.cy += (etat.ry - etat.cy) * .06;
    } else {
      etat.progres = 1; etat.cx = 0; etat.cy = 0; etat.defil = 0;
    }
    dessiner(temps);
    if (anime) etat.boucle = requestAnimationFrame(image);
  }
  const relancer = () => { if (!etat.boucle) etat.boucle = requestAnimationFrame(image); };

  // Souris (écrans à pointeur précis seulement) et défilement.
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    window.addEventListener("pointermove", (e) => {
      etat.ry = (e.clientX / window.innerWidth) * 2 - 1;
      etat.rx = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }
  window.addEventListener("scroll", () => {
    const h = boite.offsetHeight || 1;
    etat.defil = Math.min(1, Math.max(0, window.scrollY / (h * 1.6)));
  }, { passive: true });

  new ResizeObserver(() => { dimensionner(); relancer(); }).observe(boite);
  new IntersectionObserver((e) => { etat.visible = e.some((x) => x.isIntersecting); relancer(); }).observe(boite);
  document.addEventListener("visibilitychange", relancer);
  // Changement de thème ou des préférences d'animation : on redessine.
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
