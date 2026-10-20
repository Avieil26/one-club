# APK 1.0.2: startup, native layouts, OAuth return and SBC voting

Base: 000913c07c6e95c5f9a03239421837ce9c939a23. All work targets the installed Android app. No website build or Vercel alias was deployed. The additive Supabase migration described below was applied because SBC voting requires server support.

## Opening the installed app

Previously the native gate awaited the complete remote snapshot: token refresh, every community table, and a separate Storage list for every profile (94 profiles were present during investigation). Startup also explicitly checked/downloaded/reloaded Expo updates in addition to the built-in update check.

Native initialization now reads only local storage. It uses the stored account identity and, when available, a recent snapshot belonging to that same account. This is display state, not authorization: all network access and writes still use Supabase Auth and RLS. A signed-out session or different account never reuses the cache. Editable user metadata never grants admin privileges. Authentication callbacks refresh the actual identity before navigating to the signed-in app.

The community snapshot refreshes after the shell opens, with a small refresh/retry indicator. Duplicate refreshes are coalesced, and outdated native refresh responses cannot overwrite a newer sign-in/mutation. Native avatar discovery makes one `profile_avatar_paths` RPC instead of N Storage list requests. The RPC uses security-invoker and existing Storage RLS. The manual immediate OTA reload was removed; compatible updates downloaded by expo-updates apply on the next launch.

The catalogue now reuses one Hebrew ICU collator for tied-rating sorting. All 20,118 card objects AND their order hash identically before/after (`24183ff5ce6a644ba9d69115964d9cf49e2012865bf5e04ac712c9f029ef5249`). No player/card data or artwork changed.

## Native screen repair

- Player screens explicitly constrain native screen/scroll/content widths. Museum artwork is clipped to its frame; the native icon spacer is removed. The dossier's vertical stats container and background do not expand beyond the native content width.
- Native Champions always uses the stacked phone layout. Main panels, snapshots, TEKKZ details and reward cards keep natural heights and full available width, instead of desktop flex-basis/third-width constraints. Web styles are retained by platform guards.
- The unused embedded Google WebView host was removed from the app root. Native OAuth uses PKCE and the explicit `fc27israel://auth/callback` return URI. The callback route handles warm and cold returns, deduplicates code exchange, and waits for the matching account before navigation. Google can show its system authentication browser during sign-in; normal app screens do not run in that browser.
- Settings displays the installed app version. Runtime/version is 1.0.2; APK channel is `android-hotfix-20261020` so previous 1.0.0/1.0.1 OTA releases cannot replace it.

## SBC server repair — applied

`supabase/migrations/20261020085104_android_startup_and_sbc_votes.sql` adds the previously missing negative-vote table/RLS and `vote_sbc_solution` RPC. The public RPC is authenticated-only and security-invoker; its privileged implementation is in the unexposed `fc27_private` schema and validates identity, approved solution, vote value and non-self voting. A solution row lock serializes concurrent changes. Up/down/clear are exclusive and idempotent; reputation follows the current positive vote without repeat-vote farming. Anonymous RPC execution is revoked. No existing data was deleted.

`profile_avatar_paths` returns only avatar object names already covered by Storage RLS, in one call. Authenticated execution was tested. The native client no longer shows the outdated “after server update” fallback on an RPC error.

## Validation

- TypeScript; catalogue; preservation; English/Hebrew localization; 3,069 pitch placements across 31 formations: pass.
- `scripts/verify-native-startup.mjs`: initialization succeeds while auth/network is deliberately blocked, with zero network calls in the bootstrap; two concurrent refreshes share one read; 100 fixture profiles use one avatar RPC and zero Storage list calls. Cache sign-out/account isolation and warm/cold OAuth exchange deduplication pass. The fixture's approximately 1 ms bootstrap is a Node test, **not a measured phone launch time**.
- The deployed vote RPC was tested under the authenticated role using synthetic accounts/challenge/solution in a rolled-back subtransaction. Down/up/clear, duplicate votes, reputation, self-vote rejection and no-session rejection passed; zero fixture accounts remained. No real user's vote was changed.
- Actual Champions style expressions were extracted and checked with Yoga at 288/320/360/390/430/600 px for full width and natural panel/detail heights. This is a layout constraint check, not a physical Android screenshot or proof of device behavior.
- Android Hermes and web exports pass locally. Full lint retains the prior 85 errors and 48 warnings; no errors are added by new modules. Existing repository files retain their original CRLF convention (`core.whitespace=cr-at-eol` for whitespace validation).
- Supabase security advisors found no findings for the new functions/table. Unrelated existing public RPC advisories remain: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable and existing password-protection configuration: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No unrelated security configuration was changed.

## Remaining installation check

A signed APK requires the user's authenticated EAS account, unavailable in this workspace. The older APK URL is unchanged and must not be presented as this release. Build the repair commit with `npx eas-cli@latest build --platform android --profile apk` from the isolated Windows worktree. Then confirm Settings shows 1.0.2, measure launcher-to-interactive opening time, open a regular player and an icon without horizontal scrolling, inspect all Champions sections, sign in with Google and return to native UI, and vote on another user's SBC solution. Real-device launch timing, Google login, and the final signed artifact are not claimed as verified here.
