# Grounds 2.0 Preview — implementation notes

## Safety / scope
- This is a standalone preview route: `/grounds-preview`.
- It does not replace `/grounds`, change any tab, connect to profile data, or mutate Supabase.
- All people/cards and values are illustrative demo content. Contact buttons intentionally do not send messages.
- Only add the new route and this note in branch `preview/grounds-2-premium-20261011` until the design is approved.

## Visual asset stage
- The route currently uses original inline SVG art for the night pitch and generic player-portrait illustrations. This makes the layout self-contained and avoids presenting real footballers as fictional community members.
- Replace the SVG stadium with generated original artwork once available, preferably stored as `assets/images/grounds-v2-night-pitch.png`; keep dark negative space in the center/lower third so UI text remains legible.
- Generate several original generic Virtual Pro portrait cut-outs/portrait crops for sample cards. Do not use EA/FIFA marks, a cloned EA screen, or actual player portraits for fictional handles.
- Design direction: premium sports-game art; forest green / charcoal / mist / restrained lime; sharp typography and subtle movement. Avoid the current generic dark-gradient look.

## FC 27 terminology / data integrity
- EA's FC 27 Clubs / The Grounds uses Archetypes, Archetype XP (AXP), Attributes, PlayStyles, and Clubs divisions. Display "Archetype Level" only as a profile-provided value.
- Do not invent overall ratings, official level tiers, verified status, club stats, or EA account sync. The profile can distinguish self-reported details from a screenshot that was actually reviewed.
- Platform availability in current EA FC 27 The Grounds: PlayStation 5, Xbox Series X|S, PC, Nintendo Switch 2; preserve platform-specific filtering where relevant.
- Reference: https://help.ea.com/en/articles/ea-sports-fc/archetypes/
- Reference: https://www.ea.com/games/ea-sports-fc/fc-27/news/pitch-notes-fc27-launch-update

## Before merge
1. Replace SVG art with original custom assets and visually review desktop/mobile.
2. Verify terms/fields match FC 27 and avoid implied EA affiliation.
3. Run `npm run typecheck`, `git diff --check`, and `npx expo export -p web`.
4. Get explicit user approval before integrating into the live Grounds route.
