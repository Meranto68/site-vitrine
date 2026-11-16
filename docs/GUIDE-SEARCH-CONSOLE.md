# Inscrire meranto-studio.com dans Google Search Console

Google Search Console est l'outil gratuit de Google qui montre **quelles recherches font apparaître votre site**, combien de fois on clique, et les **erreurs** que Google rencontre. À faire **une fois le site en ligne** chez OVH.

## 1. Ajouter le site (10 minutes)
1. Ouvrez https://search.google.com/search-console et connectez-vous avec le compte Google de l'agence (double authentification activée).
2. Cliquez sur **« Ajouter une propriété »** et choisissez **« Domaine »** (à gauche).
3. Tapez `meranto-studio.com` (sans https ni www), puis **Continuer**.
4. Google affiche un enregistrement **TXT** qui commence par `google-site-verification=`. Copiez-le.

## 2. Prouver que le domaine est à vous (chez OVH)
1. Espace client OVH › **Noms de domaine** › `meranto-studio.com` › onglet **Zone DNS**.
2. **Ajouter une entrée** › type **TXT** › sous-domaine : laisser vide › valeur : collez le texte copié › Valider.
3. Revenez sur Search Console et cliquez sur **Valider**. Si Google dit que ce n'est pas encore visible, réessayez une heure plus tard (le délai peut aller jusqu'à 24 h).

## 3. Envoyer le plan du site
1. Dans Search Console, menu **Sitemaps**.
2. Tapez `sitemap.xml` puis **Envoyer**. Le statut doit passer à « Opération effectuée ».

## 4. Vérifier deux ou trois choses
- Menu **Inspection de l'URL** : tapez `https://meranto-studio.com/` puis **Demander l'indexation**. Faites de même pour la page Offres.
- Menu **Améliorations** : après quelques jours, la rubrique sur les questions fréquentes (données structurées de la page Questions) ne doit montrer aucune erreur.

## 5. Ensuite
- Revenez une fois par mois : menu **Performances** (recherches, clics, position moyenne).
- Les chiffres de Search Console complètent ceux de l'onglet **Site** du tableau de bord : l'un dit ce qui se passe **dans Google**, l'autre ce qui se passe **sur le site**.
- Aucune promesse de classement : ces outils servent à repérer les problèmes et les recherches utiles, pas à garantir une place.
