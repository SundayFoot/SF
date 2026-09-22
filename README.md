# Sunday Football V6.5

## Nouveauté : inscriptions des joueurs avant dimanche

Cette version ajoute une vraie liste de pré-inscription en ligne :

1. L'administrateur ouvre **👥 Équipes & joueurs**.
2. Il clique sur **📝 Ouvrir les inscriptions**.
3. Les joueurs ouvrent le site depuis leur téléphone et choisissent **📝 S'inscrire pour dimanche**.
4. Chaque joueur saisit son nom/prénom.
5. La liste se met à jour en direct.
6. L'administrateur peut supprimer un nom ou vider toute la liste.
7. L'administrateur choisit manuellement **2, 3 ou 4 équipes** et **5, 6 ou 7 joueurs par équipe**.
8. La configuration doit respecter les limites : minimum 5 joueurs par équipe, maximum 7, maximum 4 équipes.
9. Avant le premier match, l'administrateur peut utiliser **🎲 Tirage au sort des joueurs** pour répartir automatiquement les inscrits entre les équipes.
10. Le tirage n'est jamais automatique : les équipes peuvent toujours être créées/modifiées manuellement.

Règle générale : le nombre d'inscrits doit pouvoir être réparti entre 2 et 4 équipes avec au moins 5 et au plus 7 joueurs par équipe. La liste se ferme automatiquement dès que **28 joueurs** sont inscrits.

### Important
Le tirage remplace les joueurs actuellement présents dans les équipes. Il est donc volontairement bloqué dès qu'un match a commencé ou qu'un match précédent est terminé.

## Supabase

La version 6.5 utilise, en plus de `tournaments`, deux petites tables pour les inscriptions :

- `registration_settings` : indique si les inscriptions sont ouvertes.
- `player_registrations` : contient les noms inscrits.

**Il faut exécuter le nouveau `supabase.sql` dans Supabase SQL Editor.** Il conserve la table `tournaments` existante et ajoute les permissions nécessaires.

### Permissions
- Visiteurs : peuvent s'inscrire uniquement lorsque l'administrateur a ouvert les inscriptions.
- Visiteurs : peuvent voir la liste lorsque les inscriptions sont ouvertes.
- Administrateur : peut ouvrir/fermer les inscriptions, supprimer des joueurs, vider la liste et effectuer le tirage.
- Le contrôle serveur est assuré par Supabase RLS.

## Déploiement

Le projet reste compatible avec GitHub Pages. Les fichiers principaux sont :

- `index.html`
- `app.js`
- `style.css`
- `manifest.webmanifest`
- `supabase-config.js`

`supabase.sql` sert à configurer la base Supabase.
