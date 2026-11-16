// Mesure d'audience maison : une page vue = un petit message anonyme à l'application.
// Aucun cookie, aucun stockage dans le navigateur, aucun identifiant. Seuls sont envoyés : la page, le domaine
// de la page précédente, une éventuelle campagne (?utm_source=…) et le type d'écran.
// Rien n'est envoyé si le visiteur a demandé à ne pas être suivi (réglage « Do Not Track » ou « Global Privacy Control »).
(() => {
  const api = window.MERANTO_API;
  if (!api || !navigator.sendBeacon) return;
  if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true) return;
  let ref = "";
  try { ref = document.referrer ? new URL(document.referrer).hostname : ""; } catch { ref = ""; }
  const entree = !ref || ref.replace(/^www\./, "") !== location.hostname.replace(/^www\./, "");
  const largeur = window.innerWidth;
  const donnees = {
    page: location.pathname,
    ref,
    utm: new URLSearchParams(location.search).get("utm_source") || "",
    entree,
    ecran: largeur < 700 ? "mobile" : largeur < 1100 ? "tablette" : "ordinateur",
  };
  navigator.sendBeacon(`${api}/visiteSite`, new Blob([JSON.stringify(donnees)], { type: "text/plain" }));
})();
