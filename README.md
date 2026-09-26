# Sunday Football V6.16

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

## V6.16
- Inscriptions du dimanche moved to a dedicated admin page.
- Admin can open/close registrations from that page.
- Admin can view and manage the registration list before creating a tournament.
- Registration management is no longer embedded in the current-team panel.
- Added server-side admin RPCs for registration controls.

V6.16: code admin clavier texte sur mobile, couleurs des équipes, vibrations buts/fins de match et annonces colorées d'entrée.

V6.16: dashboard d'accueil, pages séparées, bouton préparation des équipes, fallback Supabase pour les RPC manquantes, annonce d'entrée avant le score.

V6.16: suppression de la dépendance aux RPC d'inscriptions, gestion joueurs avec liste visible, suppression par icône et ajout par champ dédié.

V6.16: session admin persistante après refresh, vraie déconnexion Supabase, inscriptions soumises en attente, validation admin, priorité, ajout direct des joueurs connus et limite de 28 joueurs approuvés.

V6.16: inscriptions uniquement depuis une liste blanche créée par l'administrateur, avec priorité gérée côté admin.

V6.16: une seule page visible à la fois, dashboard admin uniquement après connexion, retour dashboard après refresh pour admin, déconnexion après 30 minutes d’inactivité.

V6.16: correction des boutons Admin, sélection publique depuis la liste autorisée, inscription avec allowed_player_id et message d'aide si le nom n'est pas disponible.


V6.16: priorité = acceptation immédiate, autres demandes = confirmation admin dans l'ordre d'arrivée; tirage direct depuis les inscriptions; page publique Équipes & joueurs; live terminé masqué après la finale.


IMPORTANT V6.16 ONLINE: exécuter `supabase_v6_16_priority_migration.sql` dans Supabase > SQL Editor pour activer l'acceptation immédiate des joueurs prioritaires. Sans cette migration, l'ancien trigger continuera à mettre toutes les demandes en attente.


V6.17 : priorité invisible au public; capitaines choisis avant tirage; déplacement des joueurs entre équipes; tableau final après la finale. Exécuter `supabase_v6_17_priority_migration.sql` dans Supabase SQL Editor pour l'acceptation immédiate des joueurs prioritaires.

V6.17 UX:
- Le public ne voit jamais le statut prioritaire dans le menu des noms.
- Une demande non prioritaire indique clairement qu'elle attend confirmation et invite à revenir plus tard.
- L'administrateur choisit un capitaine par équipe avant le tirage.
- Le tirage place d'abord les capitaines puis répartit les autres joueurs aléatoirement.
- Dans Équipes & joueurs, l'administrateur peut déplacer chaque joueur vers une autre équipe.
- Après la finale, le Live et le dashboard administrateur affichent uniquement le champion, le résultat de la finale, le classement final et les équipes; aucun nouveau match n'est affiché.
- Pour le comportement priorité immédiate en ligne, exécuter `supabase_v6_17_priority_migration.sql` dans Supabase SQL Editor.

V6.18: recherche du nom par début de nom, préparation des équipes séparée du tirage, capitaines sélectionnables avant affectation, tirage utilisable sans cliquer d'abord sur Enregistrer, finale uniquement dans la page Tournoi admin, aucun match préparé après la finale, correction des champs blancs et ajout direct admin.
