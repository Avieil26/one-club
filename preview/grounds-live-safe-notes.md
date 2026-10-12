# Grounds live Preview — isolated branch

## Scope
- This branch is based on `feature/future-stars-approved-frame-preview-20261011` (commit `8203af70eaff335e1a9c84773222c35862fa3ec2`).
- Adds only `app/grounds-preview.tsx` plus this note. It does not edit `app/(tabs)/grounds.tsx`, `components/SiteNav.tsx`, `assets/images/brand-1club.png`, tabs, or Supabase.
- Open the isolated live route at `/grounds-preview`. The existing `/grounds` route intentionally remains unchanged until approved.
- Uses the existing `SiteNav` component and existing ONE CLUB brand asset, unchanged.
- Uses real community posts from `useApp().grounds` and existing published profile data. No fake recommended players, fake clubs, fake leaderboards, or fake challenge data are seeded. Empty states are shown where real data does not exist.
- The publish action uses the app's existing `/grounds/new` flow. Messaging uses the existing in-app chat path and requires sign-in.
- OVR/skill rating is labelled as a user-provided personal rating, not official EA OVR. Archetype level comes from the player post. AXP is not fabricated; it is marked unavailable until real data exists.
- PlayStyles are shown as an empty profile area until actual PlayStyles fields are captured; no fictional styles are populated.
- No EA/FIFA logos or marks are added; this remains an independent ONE CLUB community preview.

## CMD preview deployment
After switching to this branch, run typecheck and web export before `npx vercel --target preview`. The Vercel URL will still open the old Grounds at `/grounds`; use `/grounds-preview` to inspect the new route.

## Approval gate
Do not merge this route into the existing Grounds tab until the owner approves the live Preview.
