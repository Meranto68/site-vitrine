// Adresse de l'application Meranto (Cloud Functions). À renseigner après son déploiement, par exemple :
// https://europe-west1-NOM-DU-PROJET.cloudfunctions.net
// Tant qu'elle est vide : pas de mesure d'audience, et le formulaire ouvre un e-mail prérempli.
// En local (localhost), les émulateurs de l'application sont utilisés.
(() => {
  const ADRESSE_REELLE = "";
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  window.MERANTO_API = local ? "http://127.0.0.1:5001/demo-meranto/europe-west1" : ADRESSE_REELLE;
})();
