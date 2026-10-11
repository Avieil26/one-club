# Grounds 2.0 Preview — implementation notes

## Safety / scope
- This is a standalone preview route: `/grounds-preview`.
- It does not replace `/grounds`, change any tab, connect to profile data, or mutate Supabase.
- All people/cards and values are illustrative demo content. Contact buttons intentionally do not send messages.
- Only add the new route and this note in branch `preview/grounds-2-premium-20261011` until the design is approved.

## Visual asset stage
- The route currently uses original inline SVG art for an urban night football ground, floodlights, city silhouettes, crowd detail, and generic illustrated Virtual Pro portraits. No external/EA logos are used.
- The selected direction stays aligned with the approved visual concept: cinematic night football environment, dark forest green / charcoal, restrained lime and mint accents, crisp card typography and subtle motion. Do not switch to another palette or new design direction without approval.
- The real existing `SiteNav` component is reused, including the current ONE CLUB brand asset and the top tabs. Do not recreate/replace the logo in the actual app route.
- The page copy and layout are Hebrew and RTL; established gameplay terms such as OVR, LEVEL, Archetype, PlayStyles and Build remain as labels where useful.
- Each sample card presents OVR (overall rating) independently from LEVEL (Archetype progression level). Example cards include levels 1, 5, 10, 20 and 50. Their numbers/colors are illustrative design samples, not EA's official tier styling.
- Do not use EA/FIFA marks, a cloned EA screen, or actual player portraits for fictional handles.

## FC 27 terminology / data integrity
- FC 27 Clubs / The Grounds uses Archetypes and progression via Archetype XP (AXP). Keep OVR (overall rating) distinct from Archetype LEVEL; only present values supplied by the player or verified from a user-provided screenshot.
- Do not invent overall ratings, official level tiers, verified status, club stats, or EA account sync. The profile can distinguish self-reported details from a screenshot that was actually reviewed.
- Platform availability in current EA FC 27 The Grounds: PlayStation 5, Xbox Series X|S, PC, Nintendo Switch 2; preserve platform-specific filtering where relevant.
- Reference: https://help.ea.com/en/articles/ea-sports-fc/archetypes/
- Reference: https://www.ea.com/games/ea-sports-fc/fc-27/news/pitch-notes-fc27-launch-update

## Before merge
1. Replace SVG art with original custom assets and visually review desktop/mobile.
2. Verify terms/fields match FC 27 and avoid implied EA affiliation.
3. Run `npm run typecheck`, `git diff --check`, and `npx expo export -p web`.
4. Get explicit user approval before integrating into the live Grounds route.
