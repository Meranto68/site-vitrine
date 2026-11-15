# Meranto Studio — kit de marque et base de site vitrine

Version de travail finalisée pour démarrer l'intégration de l'identité de Meranto Studio.

## Contenu

- `assets/logos/` : logos SVG vectoriels (symbole, horizontal clair/sombre, monochrome, favicon).
- `site/` : site vitrine statique HTML/CSS/JavaScript, avec thème clair/sombre et panneau de préférences d'accessibilité.
- `site/tokens.css` : variables CSS de couleurs, typographie, espacements et thèmes.
- `docs/brand-guidelines.md` : direction artistique et règles d'utilisation du logo.
- `docs/accessibility.md` : engagements, tests et limites de l'accessibilité.
- `docs/implementation-checklist.md` : éléments à finaliser avant mise en ligne.

## Lancer le site en local

Le site est statique. Ouvre `site/index.html` dans un navigateur ou sers le dossier avec un serveur HTTP local. Les chemins relatifs vers les logos sont prévus pour conserver la structure du kit.

## À personnaliser avant publication

1. Ajouter les coordonnées officielles, les mentions légales et la politique de confidentialité.
2. Connecter le formulaire au backend Meranto Studio et ajouter consentement/anti-spam si nécessaire.
3. Ajouter des réalisations réelles avec autorisation et textes alternatifs adaptés.
4. Vérifier la disponibilité juridique du nom et du logo, puis déposer la marque si souhaité.
5. Réaliser des tests manuels au clavier, avec lecteur d'écran, zoom 200/400 %, mobile et utilisateurs ayant différents profils visuels.

## À propos de l'accessibilité

Le site vise les exigences pertinentes de WCAG 2.2 niveau AA et ajoute des préférences utiles à certaines personnes malvoyantes ou photosensibles : thèmes clair/sombre, contraste renforcé, texte agrandi jusqu'à 200 %, espacement accru et réduction des animations. Cela ne constitue pas une certification ni une garantie universelle, notamment pour les personnes atteintes d'albinisme : les besoins visuels sont individuels. Il faut tester avec des personnes concernées et corriger en fonction de leurs retours.

## Licence et droits

Les fichiers ont été créés pour le projet Meranto Studio. Avant usage commercial définitif, vérifier la disponibilité du nom « Meranto Studio » et effectuer les recherches d'antériorité de marque, nom de domaine et logo. Les polices sont indiquées par pile système afin de ne pas embarquer de fichiers de police tiers.
