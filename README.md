# Sunday Football V7.7 — liste propre + mobile + PWA

## Changements
- La liste des joueurs autorisés est maintenant affichée normalement : nom + ville, sans champs de texte permanents.
- Un bouton **✏️ Modifier** permet de modifier le nom et la ville.
- **🗑️ Supprimer** supprime réellement le joueur de `registration_allowed_players` et supprime aussi son éventuelle inscription de `player_registrations`, afin que le même nom puisse être ajouté immédiatement après.
- La liste d'inscription permet maintenant **2 à 6 équipes**.
- La capacité maximale passe de **28 à 42 joueurs**, nécessaire pour 6 équipes de 5 à 7 joueurs.
- Le nouveau menu mobile place les fonctions principales en bas sous forme d'icônes.
- L'application est préparée comme **PWA** : installation sur l'écran d'accueil Android/Chrome et instructions pour iPhone/iPad.
- Ajout d'un service worker et d'icônes PWA 192x192 / 512x512.

## Migration Supabase
Exécuter une fois dans Supabase SQL Editor :
`supabase_v7_7_mobile_6teams.sql`

Cette migration met la limite Supabase à 42 et nettoie définitivement les anciennes lignes `active=false`.

## PWA
Le site doit être servi en HTTPS (GitHub Pages convient). Sur Android/Chrome, le bouton **Ajouter à l'écran d'accueil / Installer** peut afficher l'installation native. Sur iPhone/iPad, utiliser Partager → Sur l'écran d'accueil.
