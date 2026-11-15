# Accessibilité — exigences de conception et de contrôle

## Objectif

Concevoir le site pour viser WCAG 2.2 niveau AA, avec des options supplémentaires de confort visuel. Ce document ne constitue pas une déclaration de conformité : seule une évaluation complète du site réel peut établir le niveau atteint.

## Pourquoi plusieurs réglages ?

Les personnes malvoyantes n'ont pas toutes les mêmes besoins. Pour certaines personnes atteintes d'albinisme, la photophobie, l'acuité visuelle et la sensibilité aux contrastes peuvent varier. Il ne faut donc pas supposer qu'un thème sombre, un thème clair ou un niveau de contraste unique conviendra à tout le monde. Le site donne le choix et permet d'adapter plusieurs paramètres indépendamment.

## Réglages fournis dans la maquette

- Thème clair avec fond légèrement chaud, afin de proposer une alternative au blanc pur.
- Thème sombre avec fond bleu nuit, pas de noir pur par défaut.
- Contraste renforcé clair et sombre.
- Taille de texte ajustable par pas jusqu'à 200 %.
- Espacement du texte augmenté (interligne et espacement des caractères).
- Réduction des animations, en plus du respect de `prefers-reduced-motion`.
- Préférences mémorisées localement lorsque le navigateur l'autorise.
- Zoom natif du navigateur non bloqué.

## Exigences de mise en œuvre

1. Contraste texte/fond d'au moins 4,5:1 pour le texte courant et 3:1 pour les grands textes, sauf exceptions prévues par WCAG.
2. Contraste des composants, bordures utiles et indicateurs de focus contrôlé séparément.
3. Toutes les fonctions accessibles au clavier ; ordre de tabulation cohérent ; focus visible.
4. Lien d'évitement vers le contenu principal.
5. Structure sémantique : en-tête, navigation, main, sections titrées, pied de page.
6. Agrandissement du texte à 200 % sans perte de contenu ou de fonction.
7. Reflow à 320 pixels CSS sans défilement horizontal pour le contenu courant.
8. Espacements de texte personnalisés sans découpage ni chevauchement.
9. Ne jamais transmettre une information par la couleur seule.
10. Liens identifiables, libellés explicites et cibles interactives suffisamment grandes.
11. Formulaires avec labels visibles, erreurs explicites et instructions compréhensibles.
12. Images informatives avec textes alternatifs ; images décoratives ignorées par les lecteurs d'écran.
13. Pas de lecture audio ou vidéo automatique, pas de clignotement, pas d'animation indispensable à la compréhension.
14. Respecter les préférences de contraste forcé et de réduction du mouvement du système.
15. Ne pas empêcher la sélection de texte, le zoom, le changement de police ou les feuilles de style utilisateur.

## Tests avant publication

- Navigation clavier complète, sans piège et avec focus visible.
- Vérification lecteur d'écran (NVDA + Firefox ou Chrome ; VoiceOver + Safari si appareils Apple ciblés).
- Zoom navigateur 200 % et 400 % ; affichage à 320 px CSS.
- Agrandissement texte via le panneau jusqu'à 200 %.
- Thèmes clair, sombre et contrastes renforcés.
- Espacement de texte augmenté.
- Préférence système de réduction des animations.
- Mode contraste forcé si disponible.
- Contrôle automatisé (axe-core ou équivalent), puis vérification manuelle : les outils automatiques seuls ne suffisent pas.
- Tests avec des personnes ayant des profils visuels variés, dont des personnes malvoyantes et, si possible, des personnes atteintes d'albinisme.

## Limites et prudence

- Le mode sombre n'est pas automatiquement meilleur pour toutes les personnes atteintes d'albinisme ou malvoyantes.
- Le contraste maximal peut gêner certains utilisateurs photosensibles ; il doit rester optionnel.
- Les préférences intégrées au site complètent, mais ne remplacent pas, le zoom du navigateur, les loupes d'écran et les technologies d'assistance.
- Un site accessible nécessite aussi des contenus accessibles : documents téléchargeables, vidéos sous-titrées, formulaires, messages d'erreur, composants tiers et pages légales doivent être évalués.
