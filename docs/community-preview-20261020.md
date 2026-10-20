# Community sessions, career journeys and SBC refresh

Preview candidate based on Android repair `9800b2d`, with the tested APK download URL from `63d9c90`. This preserves the current 20,118-card catalogue, mobile startup/auth fixes and standalone APK link. No native dependencies, generated native projects or runtime-version changes.

## Regular squads

Grounds now links to `/grounds/sessions`. Signed-in players can schedule a session, filter by platform, mode, region, language and local date, join a compatible open session, leave or decline an invitation, share its link and open existing direct messages. The host occupies a spot. Party sizes match the mode: Rush up to four, Co-op/practice two, Clubs up to eleven. Hosts complete or cancel their sessions. Completed weekly sessions can invite the same confirmed players to the following week; invitations require fresh acceptance and do not reserve capacity. Recurrence uses the host's IANA timezone to preserve local time across DST.

No automatically created events, synthetic participants or outbound email/push messages. Hosts can share links themselves. Discovery is signed-in community content; user-authored names and notes retain their original language.

## Shared career journeys

Career links to `/career/journeys`. A creator defines a club, shared rules and 1–6 immutable milestones. Each member records their own club, difficulty and initial save season, then posts short journal notes or reports completed milestones. General notes do not complete milestones. Reposting a milestone corrects the same report, without duplicate progress. Up to 100 members; leaving preserves updates, and archiving prevents new joins and updates while preserving the journal. This is self-reported progress with no XP awards or EA save/account integration.

Invitation paths survive registration/login and OAuth root/callback landings. Only whitelisted local activity routes are retained, for one hour. Preview sharing uses the current web origin; native sharing uses the production site.

## Database and startup

Three additive migrations were applied to `hxjgphhcspzjnkkzdmpk` through the database connector. Migration filenames match the recorded server versions. RLS is enabled on all five new tables. Authenticated clients can read community content; writes require the checked `community_activity` RPC. Its privileged implementation lives in the non-exposed `fc27_private` schema, with an invoker wrapper and no anonymous execution grant. Membership, owner actions, mode capacity, platform compatibility and progress bounds are validated on the server. Session membership uses a row lock to serialize admission.

These tables are loaded only on the new screens, outside the application startup snapshot. No change to Supabase URL allowlists or existing Google credential configuration.

## SBC catalogue

`assets/data/sbc-audit-20261020.json` records 30 checked entries, including four individual Marquee Matchups segments. There are 15 newly added catalogue entries. Primary requirements/rewards were checked on FUTBIN detail pages; exact UTC deadlines were cross-checked against public FUT.GG page metadata. The audit is a dated snapshot, not an automatic FUTBIN feed. At the audit time, the catalogue has 31 active entries including the non-EA practice challenge. Xavi Espart and 5×80+ expire on October 20 at 17:00 UTC and automatically disappear thereafter.

The five old unbounded editions (3×79+, Veiga, Nusa, DFG Challenge 1 and the old OTW pick) are archived. Previously recorded timed challenges continue to expire automatically. Historical lookups and solutions are retained. Catalogue overrides win over stale server or native-cache copies. Expired built-ins cannot start a new upload through the app. New 10-player and multi-segment challenges use screenshot solutions instead of incorrectly treating them as a standard eleven-player puzzle.

Additional corrections: Pina's expiry and score; current POTM scores; TOTW 1–5 reward/score; 5×80+ score/expiry; Gold/Silver/Bronze upgrade rewards; foundation groups. FUTBIN/FUT.GG disagree on a league label for Ferran Torres, so the app uses a neutral player-based POTM title. The stale October 1 Marquee banner was replaced with the dated catalogue verification notice. The four current Marquee segments show their individual rewards and the group completion bonus.

## Validation

- TypeScript, catalogue/preservation, Hebrew/English localization (including mini-games), mobile layout and native startup regressions passed.
- `verify:community` checks local date/DST validation, matching, safe invitation return and SBC deadlines/cache precedence/archive behavior.
- `scripts/verify-community-activities.sql` passed under the real authenticated database role inside an explicit outer `BEGIN`/`ROLLBACK`, plus an inner fixture rollback. Checks cover party limits, full sessions, incompatible platforms, idempotency, owner restrictions, DST recurrence, invitation acceptance, leaving, membership, milestone bounds, journal notes and archived/anonymous rejection. Zero fixture users remained.
- `scripts/verify-community-ui.mjs` exercised the production web export with all Supabase HTTP calls mocked: create/join/leave sessions, create/join journeys, general and milestone updates, invitation return through login and OAuth root landing, Hebrew/English at 390px, and a 1280px layout check. No page errors or oversized controls. Real server permissions were tested separately in SQL.
- Web and Android JavaScript/Hermes exports passed. No new signed APK was built, and this is not a device validation of the new flows.
- Full ESLint retains the baseline 85 errors and 48 warnings, with no newly introduced diagnostics. New feature modules and routes pass targeted lint. Existing warnings were not suppressed or broadly refactored.
- Supabase security advisors show the same pre-existing 18 public definer-function warnings and password-protection notice; none concern the new tables or RPC.

## Preview rollout

Publish this branch/commit to the existing `fc27-israel` Vercel project as a Preview first. The connected Vercel account lacks access to the user's team, so deployment uses the owner's existing Windows CLI session. Review with real accounts: two-player admission and leave/rejoin, weekly invitation confirmation, career progress, Hebrew/English, expired SBC removal and the APK download. Review native changes on a real phone before publishing a new APK/OTA. Production deployment is a separate step after Preview review.
