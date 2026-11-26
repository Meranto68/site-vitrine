# DESIGN.md · Meranto Studio

Système visuel du site vitrine. Chaque page l'applique via les variables de `site/assets/css/tokens.css` : jamais de valeur en dur dans les pages.

## Direction
- **Pour qui** : dirigeants de petites entreprises et de cliniques vétérinaires, peu techniciens, qui veulent un site à jour sans y passer de temps.
- **Ce que le site doit faire** : rassurer (méthode claire, réalisation réelle) et mener à la demande de devis.
- **Sensation** : un studio moderne et précis, pas une start-up tape-à-l'œil. Sérieux dans le texte, une seule audace visuelle : le ruban 3D.
- **Élément signature** : le « M » du logo devient un ruban en 3D (WebGL, sans bibliothèque) dans l'en-tête de l'accueil. Le même dégradé sert de fil conducteur fin (frise des étapes). Il n'est jamais utilisé derrière du texte.

## Couleurs
Tirées du logo : ruban bleu `#2460EA` → cyan `#3FC3F2` → turquoise `#1FE0BC`, étoile `#EEF2F8`.

| Jeton | Sombre (défaut) | Clair | Rôle |
|---|---|---|---|
| `--paper` | `#071430` | `#F3F6FC` | Fond de page (bleu nuit, pas du noir) |
| `--surface` | `#0C1C3E` | `#FFFFFF` | Panneaux, formulaire, tableau |
| `--surface-soft` | `#132755` | `#E6EDF8` | Survol, en-têtes de groupe |
| `--line` | `#1F3567` | `#D5DDEB` | Séparateurs (décoratifs) |
| `--border` | `#5A73AB` | `#7685A6` | Bordures de champs et boutons (≥ 3:1) |
| `--ink` | `#F2F6FF` | `#0A1A3F` | Texte principal |
| `--muted` | `#A9B9DB` | `#46557A` | Texte secondaire (≥ 6:1) |
| `--action` / `--action-text` | `#5CE1F2` / `#061230` | `#2159E6` / `#FFFFFF` | Bouton principal, état actif |
| `--accent-text` | `#7DD8F7` | `#1B4FB0` | Liens, petits repères |
| `--live` | `#2EE6C3` | `#08756C` | « Inclus », validations |
| `--warn` / `--error` | `#F5B865` / `#FF8A80` | `#8A4B00` / `#B42318` | À compléter, erreurs |

- `--ruban` : dégradé de marque, **décoratif uniquement** (jamais pour du texte).
- Modes « contraste renforcé » (noir/blanc) conservés, réglables dans le panneau Accessibilité.

## Typographie
- **Titres** : Bricolage Grotesque (variable 200–800), graisse 700, interlettrage serré. Caractère éditorial, sans rien de « par défaut ».
- **Texte** : Figtree (variable 300–900), 400 / 600, proche des formes rondes du mot « Studio » du logo.
- Échelle (rem) : 0,875 · 1 · 1,0625 (texte) · 1,25 · 1,5 · 2 · 2,75 · titre d'accueil `clamp(2.9rem, 6.6vw, 5.6rem)`.
- Lignes de 60 à 70 caractères ; titres en casse de phrase, sans capitales décoratives ni mot isolé en couleur.

## Espacements et formes
- Base 8 px. Sections : `clamp(4.5rem, 9vw, 8rem)`. Largeur de contenu : 76rem.
- Rayons : 10 px (champs, boutons), 18 px (panneaux), 28 px (scènes 3D, grands blocs), pilule pour les badges.
- Une seule ombre (`--shadow`), pour ce qui flotte : appareils 3D, menu ouvert.

## Composants
- Boutons : principal (plein), secondaire (contour), discret (lien souligné). Survol, focus visible 3 px, désactivé. Pas de flèche ajoutée au texte.
- Frise des étapes : vraie séquence, donc numérotée ; reliée par le fil dégradé.
- Scène 3D d'appareils (ordinateur + téléphone) : CSS 3D, s'incline au survol, l'écran défile avec la page ; bascule Avant / Après.
- Tableau des changements (page Réalisation) : Sujet · Avant · Maintenant.

## Mouvement
- Un seul moment orchestré : le ruban se dessine à l'arrivée (≈ 1,6 s), puis respire doucement.
- Le reste ne bouge qu'en réponse au visiteur (survol, défilement, clic), en `ease-out`, 150 à 250 ms.
- « Réduire les animations » (système ou panneau) : ruban figé, aucune inclinaison ni défilement automatique.

## Images
- Captures réelles de réalisations, publiées avec l'accord du client, visages flous.
- Icônes : trait 1,8 px, coins arrondis, même jeu partout. Pas d'émoji.
