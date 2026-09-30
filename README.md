# Sunday Football V8.0 — Mobile UI/UX redesign

Cette version reprend **le design et le langage UI/UX du fichier de référence fourni** : fond bleu/noir, cartes glassmorphism, coins arrondis, accent vert, typographie Plus Jakarta Sans / Orbitron, icônes Font Awesome et navigation basse.

## Important
- Le contenu et les fonctions métier existants de V7.9 sont conservés.
- Le PC garde son interface et son fonctionnement actuels.
- Les changements visuels ciblent principalement les écrans de téléphone.
- Le Live mobile est maintenant réellement séparé en pages : Accueil, Classement, Historique, Terrain, Équipe.
- Les deux navigations mobiles utilisent des événements JavaScript directs ; elles ne dépendent plus du clic programmatique sur des boutons cachés.
- Le contenu desktop du Live est masqué sur téléphone pour éviter le doublage et l'effet de page géante observé précédemment.
- La liste admin des joueurs autorisés reste repliable.
- La PWA et les fonctions Supabase de V7.9 sont conservées.

## Déploiement
Remplacer les fichiers de la version précédente par ceux de cette ZIP sur GitHub Pages.

Aucune nouvelle migration SQL n'est nécessaire pour le redesign UI/UX de V8.0 : les migrations V7.5 à V7.9 restent incluses dans la ZIP pour conserver l'installation complète.

## PWA
Le cache du service worker a été versionné en V8.0 afin que les téléphones récupèrent la nouvelle interface au lieu de conserver l'ancien CSS/JS en cache.
