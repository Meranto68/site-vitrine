# Site vitrine Meranto Studio

Site statique (HTML, CSS, JavaScript, sans framework ni dépendance) pour **meranto-studio.com**.
Parti pris graphique (détail dans `DESIGN.md`) : palette tirée du logo (ruban bleu → cyan → turquoise sur bleu nuit), titres en Bricolage Grotesque, texte en Figtree. Une seule audace : dans l'accueil, le logo reste plat et seule son **étoile tourne en 3D** (WebGL écrit à la main, aucune bibliothèque). La réalisation Maison Bleue est présentée sur un ordinateur et un téléphone en 3D (CSS), avec un avant/après qu'on fait défiler de haut en bas et le tableau de tout ce qui a changé.

**Aperçu en ligne (GitHub Pages)** : https://meranto68.github.io/site-vitrine/ (redirige vers le dossier `site/`).

## Organisation
- `src/pages/` : le contenu de chaque page (un bloc `<!--meta {...} -->` en tête : titre, description, lien actif du menu).
- `src/partials/` : en-tête et pied de page communs. `src/gabarit.html` : squelette commun.
- `site/` : **le site prêt à publier** (pages assemblées, styles, scripts, polices, images, `.htaccess`, `sitemap.xml`, `robots.txt`).
- `outils/assembler.mjs` : assemble `src/` vers `site/`.
- `DESIGN.md` : le système visuel (couleurs, polices, espacements, composants, mouvement). Les valeurs sont dans `site/assets/css/tokens.css`.
- `site/assets/js/etoile3d.js` : l'étoile 3D (s'arrête hors écran, figée si « réduire les animations », étoile plate si la 3D n'est pas disponible).
- `index.html` (racine) : simple redirection vers `site/` pour l'aperçu GitHub Pages ; ne pas l'envoyer chez OVH.
- `assets/logos/` : la banque de logos complète (SVG, PNG, favicons, image de partage). Seuls les fichiers utiles sont copiés dans `site/` ; ce dossier-là ne s'envoie pas chez l'hébergeur.

## Modifier puis publier
1. Modifier une page dans `src/pages/` (ou le style dans `site/assets/css/`).
2. `npm run construire` (ou `node outils/assembler.mjs`) : régénère les pages de `site/`.
3. Aperçu local : `npm run apercu` puis ouvrir http://localhost:8000.
4. Publication chez OVH : envoyer **le contenu du dossier `site/`** (y compris le fichier caché `.htaccess`) à la racine de l'hébergement (dossier `www`), par FTP ou SFTP.

## Formulaire de contact
Il envoie la demande à l'application Meranto (fonction `contactSite`) : un dossier est créé et l'accusé de réception attend votre validation dans « À valider ».
- Après le déploiement de l'application, renseigner son adresse dans `site/assets/js/contact.js` (`ADRESSE_REELLE`).
- Tant qu'elle est vide, le formulaire ouvre un e-mail prérempli vers contact@meranto-studio.com.
- En local (`localhost`), il utilise les émulateurs de l'application.

## Avant publication
- Compléter les éléments surlignés « À COMPLÉTER » des pages Mentions légales et Confidentialité, puis les faire relire (À VALIDER PAR UN PROFESSIONNEL).
- Vérifier que l'accord écrit de la Clinique Maison Bleue est archivé (page Réalisation : captures du site, photos de l'équipe floutées).

Polices Bricolage Grotesque et Figtree : SIL Open Font License 1.1 (licences dans `site/assets/fonts/`), hébergées sur le site.
