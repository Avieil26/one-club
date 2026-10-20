# Community sessions, career journeys and SBC refresh

Preview candidate based on Android repair `9800b2d`, with the tested APK download URL from `63d9c90`. This preserves the current 20,118-card catalogue, mobile startup/auth fixes and standalone APK link. No native dependencies, generated native projects or runtime-version changes.

## Regular squads

Grounds now links to `/grounds/sessions`. Signed-in players can schedule a session, filter by platform, mode, region, language and local date, join a compatible open session, leave or decline an invitation, share its link and open existing direct messages. The host occupies a spot. Party sizes match the mode: Rush up to four, Co-op/practice two, Clubs up to eleven. Hosts complete or cancel their sessions. Completed weekly sessions can invite the same confirmed players to the following week; invitations require fresh acceptance and do not reserve capacity. Recurrence uses the host's IANA timezone to preserve local time across DST.

No automatically created events, synthetic participants or outbound email/push messages. Hosts can share links themselves. Discovery is signed-in community content; user-authored names and notes retain their original language.

## Shared career journeys

Career links to `/career/journeys`. A creator defines a club, shared rules and 1–6 immutable milestones. Each member records their own club, difficulty and initial save season, then posts short journal notes or reports completed milestones. General notes do not complete milestones. Reposting a milestone corrects the same report, without duplicate progress. Up to 100 members; leaving preserves updates, and archiving prevents new joins and updates while preserving the journal. This is self-reported progress with no XP awards or EA save/account integration.

Invitation paths survive registration/login and OAuth root/callback landings. Only whitelisted local activity routes are retained, for one hour. Preview sharing uses the current web origin; native sharing uses the production site.

## Database and startup

Four additive migrations were applied to `hxjgphhcspzjnkkzdmpk` through the database connector. Migration filenames match the recorded server versions. RLS is enabled on all five new tables. Authenticated clients can read community content; writes require the checked `community_activity` RPC. Its privileged implementation lives in the non-exposed `fc27_private` schema, with an invoker wrapper and no anonymous execution grant. Membership, owner actions, mode capacity, platform compatibility and progress bounds are validated on the server. Session membership uses a row lock to serialize admission.

These tables are loaded only on the new screens, outside the application startup snapshot. No change to Supabase URL allowlists or existing Google credential configuration.

## SBC catalogue

`assets/data/sbc-audit-20261020.json` records 32 checked entries, including four individual Marquee Matchups segments. There are 17 newly added catalogue entries. Primary requirements/rewards were checked on FUTBIN detail pages; exact UTC deadlines were cross-checked against public FUT.GG page metadata. The audit is a dated snapshot, not an automatic FUTBIN feed. At the audit time, the catalogue has 31 active entries including the non-EA practice challenge. The evening recheck at 18:25 UTC added MLS Future Stars Player Pick (13,000 points) and 2×83+ Upgrade (5,500 points), both ending October 27 at 18:00:01 UTC according to FUT.GG metadata. Xavi Espart and 5×80+ expired October 20 at 17:00 UTC and are excluded from active listings while their history remains accessible.

The five old unbounded editions (3×79+, Veiga, Nusa, DFG Challenge 1 and the old OTW pick) are archived. Previously recorded timed challenges continue to expire automatically. Historical lookups and solutions are retained. Catalogue overrides win over stale server or native-cache copies. Expired built-ins cannot start a new upload through the app. New 10-player and multi-segment challenges use screenshot solutions instead of incorrectly treating them as a standard eleven-player puzzle.

Additional corrections: Pina's expiry and score; current POTM scores; TOTW 1–5 reward/score; 5×80+ score/expiry; Gold/Silver/Bronze upgrade rewards; foundation groups. FUTBIN/FUT.GG disagree on a league label for Ferran Torres, so the app uses a neutral player-based POTM title. The stale October 1 Marquee banner was replaced with the dated catalogue verification notice. The four current Marquee segments show their individual rewards and the group completion bonus.

## Validation

- TypeScript, catalogue/preservation, Hebrew/English localization (including mini-games), mobile layout and native startup regressions passed.
- `verify:community` checks local date/DST validation, matching, safe invitation return and SBC deadlines/cache precedence/archive behavior.
- `scripts/verify-community-activities.sql` passed under the real authenticated database role inside an explicit outer `BEGIN`/`ROLLBACK`, plus an inner fixture rollback. Checks cover party limits, full sessions, incompatible platforms, idempotency, owner restrictions, DST recurrence, invitation acceptance, leaving, membership, milestone bounds, journal notes and archived/anonymous rejection. Zero fixture users remained.
- `scripts/verify-community-ui.mjs` exercised the production web export with all Supabase HTTP calls mocked: create/join/leave sessions, create/join journeys, general and milestone updates, invitation return through login and OAuth root landing, Hebrew/English at 390px, and a 1280px layout check. No page errors or oversized controls. Real server permissions were tested separately in SQL.
- Web and Android JavaScript/Hermes exports passed. No new signed APK was built, and this is not a device validation of the new flows.
- The latest CI full ESLint run reports existing repository diagnostics (68 errors and 27 warnings); this is not a clean full-repository lint result. Changed feature modules and routes pass targeted lint. Existing warnings were not suppressed or broadly refactored.
- Supabase security advisors show the same pre-existing 18 public definer-function warnings and password-protection notice; none concern the new tables or RPC.

GitHub Actions also checks the exact candidate commit with TypeScript, mobile/startup regressions and the complete web build (catalogue preservation, localization and community/SBC checks). The source-inspection script is a manual read-only audit helper; builds use the checked-in snapshot and do not depend on access to external SBC sites.

## Preview rollout

Publish this branch/commit to the existing `fc27-israel` Vercel project as a Preview first. The connected Vercel account lacks access to the user's team, so deployment uses the owner's existing Windows CLI session. Review with real accounts: two-player admission and leave/rejoin, weekly invitation confirmation, career progress, Hebrew/English, expired SBC removal and the APK download. Review native changes on a real phone before publishing a new APK/OTA. Production deployment is a separate step after Preview review.

## Preview review follow-up

The SBC list now orders active challenges by their actual creation date, newest first. Reward previews resolve the exact current player item, dynamic portrait and promo background, rather than rendering every player as a base gold card. Player picks/Hero upgrades use their distinct source artwork, while pack rewards use the matching pack family and rating/count stamp. Artwork is isolated from the 20,118-player catalogue.

Twenty source-dated Streamlined rating combinations are available (18 remain active at the October 20 evening check). They are base rare-item combinations from FUT.GG, without a cheapest-price promise or fabricated community author/votes. The user must confirm the in-game item score before submitting. Future Stars Challenge 3 also has an app-built eleven-player example that passes every listed rule with 33 chemistry; existing Gold/Silver examples remain available.

Sessions and Grounds profiles now select from 249 countries with bilingual search. New values are ISO country codes in the existing region field, preserving older APK/API compatibility. An additive database constraint migration allows ISO values alongside legacy server regions. Broad legacy regions are shown as country not selected rather than inventing a country. Older explicit Israeli regional profiles display Israel. Authenticated-role rollback checks pass for a session saved with Germany, with zero fixtures remaining.

Shared career journeys are a third tab alongside scouting and challenges, and have their own deep link. Community list/form/detail screens use the site's stadium imagery, compact section borders, form steps and readable field styles; filters are collapsed until requested. Browser checks cover Hebrew/English at phone width, country selection and round-trip session payload, career navigation, SBC order and visible reward artwork. No production deployment or signed APK update is included.
