// Assemble les pages du site : src/pages/*.html + gabarit commun (en-tête, pied de page) → site/*.html.
// Aucune dépendance : « node outils/assembler.mjs » (ou « npm run construire »). Le dossier site/ est ce qu'on envoie chez l'hébergeur.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const URL_SITE = "https://meranto-studio.com";
const lire = (chemin) => readFileSync(join(racine, chemin), "utf8");
const gabarit = lire("src/gabarit.html");
const entete = lire("src/partials/entete.html");
const pied = lire("src/partials/pied.html");

const URL_LOGO = `${URL_SITE}/assets/logos/icone-512.png`;

/** Données structurées (lues par les moteurs de recherche), au format JSON-LD. */
function donneesStructurees(meta, contenu) {
  const blocs = [];
  if (meta.nav === "accueil") {
    blocs.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Meranto Studio",
      url: `${URL_SITE}/`,
      logo: URL_LOGO,
      email: "contact@meranto-studio.com",
      description: meta.description,
      contactPoint: { "@type": "ContactPoint", contactType: "customer service", email: "contact@meranto-studio.com", availableLanguage: "French" },
    });
  }
  if (meta.nav === "faq") {
    // Questions et réponses tirées de la page elle-même : toujours identiques à ce qui est affiché.
    const texte = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const questions = [...contenu.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<div>([\s\S]*?)<\/div>/g)].map((m) => ({
      "@type": "Question",
      name: texte(m[1]),
      acceptedAnswer: { "@type": "Answer", text: texte(m[2]) },
    }));
    if (questions.length > 0) blocs.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions });
  }
  return blocs.map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, "\\u003c")}</script>`).join("\n  ");
}

const pages = [];
for (const fichier of readdirSync(join(racine, "src/pages")).filter((f) => f.endsWith(".html")).sort()) {
  const brut = lire(`src/pages/${fichier}`);
  const m = brut.match(/^<!--meta\s+([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`${fichier} : bloc <!--meta {...} --> absent`);
  const meta = JSON.parse(m[1]);
  for (const cle of ["titre", "description"]) if (!meta[cle]) throw new Error(`${fichier} : « ${cle} » manquant`);
  const contenu = brut.slice(m[0].length);
  // Lien de la page courante dans le menu : aria-current="page".
  const enteteActif = entete.replace(new RegExp(`data-nav="${meta.nav ?? "aucun"}"`, "g"), `data-nav="${meta.nav}" aria-current="page"`);
  const chemin = fichier === "index.html" ? "" : fichier;
  const html = gabarit
    .replaceAll("{{titre}}", meta.titre)
    .replaceAll("{{description}}", meta.description)
    .replaceAll("{{canonique}}", `${URL_SITE}/${chemin}`)
    .replace("{{donnees}}", donneesStructurees(meta, contenu))
    .replace("{{base}}", meta.base ? `<base href="${meta.base}">` : "")
    .replaceAll("{{robots}}", meta.indexer === false ? "noindex, follow" : "index, follow")
    .replace("{{entete}}", enteteActif)
    .replace("{{pied}}", pied)
    .replace("{{contenu}}", contenu)
    .replace("{{scripts}}", (meta.scripts ?? []).map((s) => `<script src="assets/js/${s}" defer></script>`).join("\n  "));
  if (/\{\{[a-z]+\}\}/.test(html)) throw new Error(`${fichier} : variable du gabarit non remplacée`);
  writeFileSync(join(racine, "site", fichier), html);
  if (meta.indexer !== false) pages.push(chemin);
}

writeFileSync(join(racine, "site/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${URL_SITE}/${p}</loc></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(racine, "site/robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${URL_SITE}/sitemap.xml\n`);
console.log(`${String(pages.length)} pages indexables assemblées dans site/`);
