# Sunday Football V8.4

## Changes
- Safer iPhone navigation: large back buttons, lower placement, and browser back/swipe-back returns to the previous in-app page.
- Admin logout button enlarged for touch use.
- Default team setup order: **Sans maillot (white), Rouge, Bleu, Jaune, Vert**, then additional colors.
- New tournaments keep the default team order for the first match unless the admin changes the queue order.
- Removed all visible scorer/buteur features and scorer rankings. Goals remain team-level only.
- With exactly 3 teams, semifinal format is: **1st directly to final; 2nd vs 3rd in semifinal; winner vs 1st in final**.
- Team creation now offers registered-player suggestions while typing in the player list. Suggestions are optional; the admin can still type a completely new player name.
- Service worker cache bumped to V8.4.

## Supabase
No new SQL migration is required for these changes.
