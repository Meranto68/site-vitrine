# Site vitrine Meranto Studio

Site statique (HTML, CSS, JavaScript, sans framework ni dépendance) pour **meranto-studio.com**.
Parti pris graphique : le site se lit comme le **suivi d'une commande** (bande de statut, cartes de suivi, fil qui relie les sections).

## Organisation
- `src/pages/` : le contenu de chaque page (un bloc `<!--meta {...} -->` en tête : titre, description, lien actif du menu).
- `src/partials/` : en-tête et pied de page communs. `src/gabarit.html` : squelette commun.
- `site/` : **le site prêt à publier** (pages assemblées, styles, scripts, polices, images, `.htaccess`, `sitemap.xml`, `robots.txt`).
- `outils/assembler.mjs` : assemble `src/` vers `site/`.
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
- Vérifier que l'accord écrit de la Clinique Maison Bleue est archivé (page Exemple).

Polices Poppins et Inter : SIL Open Font License 1.1 (licences dans `site/assets/fonts/`).
