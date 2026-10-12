# Grounds 2.0 Preview — implementation notes

## Safety / scope
- This is a standalone preview route: `/grounds-preview`.
- It does not replace `/grounds`, change any tab, or mutate Supabase. The preview reads currently published Grounds posts/profile fields through the existing app store; messaging routes through the existing in-app chat only after sign-in.
- Player cards are sourced from real published posts; no hardcoded sample members, fake clubs, or fake leaderboards are shown. Challenges and club-ranking sections remain empty/coming soon until real data exists.
- The implementation is isolated in branch `preview/grounds-live-20261012` until the design is approved.

## Visual asset stage
- The route uses the repository's existing photographic `assets/images/scene-grounds.png` as a continuous page background (not a hand-drawn pitch). Generic illustrated portraits are only fallbacks when a published profile has no picture. No EA logos or marks are used.
- The selected direction stays aligned with the approved visual concept: cinematic night football environment, dark forest green / charcoal, restrained lime and mint accents, crisp card typography and subtle motion. Do not switch to another palette or new design direction without approval.
- The real existing `SiteNav` component from current `main` is reused, including the exact existing ONE CLUB brand asset and current navigation tabs. Do not modify `components/SiteNav.tsx`, its brand image, or tab order for this preview.
- Hebrew copy, paragraph alignment, filters, buttons, cards and dashboard rows use right-to-left direction; the English THE GROUNDS wordmark remains on the left as requested. Established gameplay terms such as OVR, LEVEL, Archetype, PlayStyles and Build remain where useful.
- Player cards show Clubs Archetype Level and display the optional user-provided skill rating as 'דירוג אישי' instead of falsely labelling it an official OVR. A profile image is optional. A profile picture is not level proof; the level-evidence field is not auto-populated from an avatar.
- Do not use EA/FIFA marks, a cloned EA screen, or actual player portraits for fictional handles.

## FC 27 terminology / data integrity
- FC 27 Clubs / The Grounds uses Archetypes and progression via Archetype XP (AXP). Keep OVR (overall rating) distinct from Archetype LEVEL; only present values supplied by the player or verified from a user-provided screenshot.
- Do not invent overall ratings, official level tiers, verified status, club stats, or EA account sync. The profile can distinguish self-reported details from a screenshot that was actually reviewed.
- Platform availability in current EA FC 27 The Grounds: PlayStation 5, Xbox Series X|S, PC, Nintendo Switch 2; preserve platform-specific filtering where relevant.
- Reference: https://help.ea.com/en/articles/ea-sports-fc/archetypes/
- Reference: https://www.ea.com/games/ea-sports-fc/fc-27/news/pitch-notes-fc27-launch-update

## Content rules
- Recommended player cards are rendered only from actual community Grounds posts in the existing app store; no invented member cards or ratings are seeded.
- Top Clubs stays in an empty state until real club ranking data exists. Challenges show a clear "בקרוב" state rather than fake challenges.
- The existing `app/grounds/new.tsx` post flow remains the only publication flow; its optional photo picker lets the author upload a player image or an in-game player screenshot. No profile picture is treated as level proof.

## Before merge
1. Visually review the photographic background behavior and right-to-left layout on desktop/mobile.
2. Verify terms/fields match FC 27 and avoid implied EA affiliation.
3. Run `npx tsc --noEmit`, `git diff --check`, and `npx expo export -p web`.
4. Get explicit user approval before integrating into the live Grounds route.
