// Formulaire de contact : vérifications dans la page, puis envoi à l'application Meranto (dossier + accusé de réception à valider).
// Si l'adresse de l'application n'est pas encore configurée, le formulaire ouvre un e-mail prérempli à la place.
(() => {
  // Adresse de la fonction « contactSite » de l'application, à renseigner après son déploiement
  // (ex. https://europe-west1-PROJET.cloudfunctions.net/contactSite). En local : les émulateurs.
  const ADRESSE_REELLE = "";
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  const ADRESSE = local ? "http://127.0.0.1:5001/demo-meranto/europe-west1/contactSite" : ADRESSE_REELLE;
  const EMAIL = "contact@meranto-studio.com";

  const form = document.getElementById("formulaireContact");
  const retour = document.getElementById("retour");
  const bouton = document.getElementById("envoyer");
  const ouvertLe = Date.now();

  // Formule choisie depuis la page Offres (contact.html?formule=A).
  const formule = new URLSearchParams(location.search).get("formule");
  if (formule === "A" || formule === "B") {
    const radio = form.querySelector(`input[name="formule"][value^="${formule} "]`);
    if (radio) radio.checked = true;
  }

  const champs = {
    nomClinique: (v) => (v.trim().length >= 2 ? "" : "Indiquez le nom de votre entreprise."),
    activite: (v) => (v.trim().length >= 2 ? "" : "Indiquez votre activité, par exemple « boulangerie »."),
    ville: (v) => (v.trim() ? "" : "Indiquez la ville."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Indiquez une adresse e-mail valide, par exemple nom@clinique.fr."),
    site: (v) => (!v.trim() || /^https?:\/\/[^\s.]+\.[^\s]+$/.test(v.trim()) ? "" : "Indiquez l'adresse complète, qui commence par https://"),
    message: (v) => (v.trim().length >= 10 ? "" : "Décrivez votre besoin en quelques mots (10 caractères au moins)."),
  };

  function afficherErreur(id, texte) {
    const champ = document.getElementById(id);
    const zone = document.getElementById(`erreur-${id}`);
    champ.setAttribute("aria-invalid", texte ? "true" : "false");
    zone.textContent = texte;
    zone.hidden = !texte;
  }

  function verifier() {
    let premier = null;
    for (const [id, regle] of Object.entries(champs)) {
      const texte = regle(document.getElementById(id).value);
      afficherErreur(id, texte);
      if (texte && !premier) premier = id;
    }
    const consent = document.getElementById("consentement");
    afficherErreur("consentement", consent.checked ? "" : "Cochez la case pour que nous puissions vous répondre.");
    if (!consent.checked && !premier) premier = "consentement";
    if (premier) document.getElementById(premier).focus();
    return !premier;
  }

  // Une erreur disparaît dès que le champ est corrigé.
  for (const id of Object.keys(champs)) {
    document.getElementById(id).addEventListener("blur", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") afficherErreur(id, champs[id](e.target.value));
    });
  }

  function montrer(ok, titre, texte) {
    retour.className = `formulaire-retour${ok ? "" : " erreur"}`;
    retour.innerHTML = "";
    const t = document.createElement("strong");
    t.textContent = titre;
    const p = document.createElement("p");
    p.textContent = texte;
    retour.append(t, p);
    retour.hidden = false;
    retour.focus();
  }

  function donnees() {
    const f = new FormData(form);
    const choix = String(f.get("formule") || "ne sait pas");
    const activite = String(f.get("activite") || "").trim();
    const message = `[Activité : ${activite}]\n${String(f.get("message")).trim()}`;
    return {
      nom_clinique: String(f.get("nom_clinique")).trim(),
      ville: String(f.get("ville")).trim(),
      site: String(f.get("site")).trim(),
      email: String(f.get("email")).trim(),
      message: choix === "ne sait pas" ? message : `[Formule : ${choix}]\n${message}`,
      consentement: f.get("consentement") === "on",
      piege: String(f.get("piege") || ""),
      duree_ms: Date.now() - ouvertLe,
    };
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!verifier()) return;
    const d = donnees();
    if (!ADRESSE) {
      // Application pas encore branchée : e-mail prérempli.
      const corps = `Entreprise : ${d.nom_clinique} (${d.ville})\nSite : ${d.site || "aucun"}\n\n${d.message}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Demande de devis : ${d.nom_clinique}`)}&body=${encodeURIComponent(corps)}`;
      montrer(true, "Votre messagerie s'ouvre.", `Envoyez le message prérempli à ${EMAIL} : nous vous répondons sous 24 heures ouvrées.`);
      return;
    }
    bouton.disabled = true;
    bouton.firstChild.textContent = "Envoi en cours… ";
    try {
      const r = await fetch(ADRESSE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        form.querySelectorAll("input, textarea, button").forEach((el) => { el.disabled = true; });
        bouton.firstChild.textContent = "Demande envoyée ";
        montrer(true, "C'est envoyé.", j.message || "Nous vous répondons par e-mail sous 24 heures ouvrées.");
        return;
      }
      montrer(false, "Envoi impossible.", `${j.message || "Une erreur est survenue."} Vous pouvez aussi écrire à ${EMAIL}.`);
    } catch {
      montrer(false, "Envoi impossible pour le moment.", `Vérifiez votre connexion, ou écrivez-nous directement à ${EMAIL}.`);
    }
    bouton.disabled = false;
    bouton.firstChild.textContent = "Envoyer ma demande ";
  });
})();
