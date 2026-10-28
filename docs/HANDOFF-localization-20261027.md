# Handoff: five-language localization, 27 October 2026

## User's goal and instructions
Complete Arabic (ar), Brazilian Portuguese (pt-BR) and Spanish (es), alongside existing Hebrew and English, on the website. Translate every interface screen, generated and data-driven content, registration, errors, Terms, Privacy, Cookies and Accessibility. No silent Hebrew/English fallback when a new language is selected, apart from proper names and intentional game branding. Check translation accuracy and football terminology against authoritative sources. Language picker appears once before registration; choice persists and can later be changed in Settings. User authorized saving work to a separate GitHub branch. Do not repeatedly stop to ask them to continue. User now requested this handoff because the conversation hit its length limit.

## Authoritative saved source
Repository: Avieil26/one-club
Branch: work/add-languages-20261027
Latest code commit before this document: b954f76bbb71587ab8cbbb3764e775b2ca099529
All feature code and translation dictionaries produced here have been saved to this remote branch through the GitHub connector.
IMPORTANT: this branch is an INCOMPLETE DRAFT, not a finished localization. Nothing from this work was deployed to production or mobile.

Branch started from exact production commit 6698979f6e2b4eccf182a454fd27544d571b70ef. Production project: fc27-israel, Vercel team team_BRmlODDv8dJilqOMm6y1Zwhs (slug avielindapurkar717-9878s-projects), project prj_bgXR0dRKtLK3lkfLYLRgyLXa4YrO. Public URL https://fc27-community.vercel.app. At the last read production deployment was dpl_CYnsLZ2NrMKK2yENUSbsVfLycj2a. Recheck production before future release; it may have changed.

## Preservation requirements
Read AGENTS.md from current production and branch. Never replace newer production with an older preview. Reconcile only an explicit allowlist of localization changes into exact current production. Preserve 20,198 unique cards and all 51 recent editions, gallery token planner, corrected 4-3-3 formations and removed old Season 2 homepage announcement. Do not change unrelated data, assets, backend, native settings or package scripts.
Current stack: Expo SDK 57, React Native 0.86.3, React 19.2.3, npm/package-lock. Read versioned Expo docs before editing native APIs.

## Implemented draft code
- lib/language.tsx: AppLocale adds ar/pt-BR/es; locale and isRTL added to context. Existing AppLanguage and language remain LEGACY he/en for compatibility (new locales expose legacy language=en). Saved-choice storage key remains fc27-language.
- NEW_LOCALES_READY=false intentionally. New locales are hidden and rejected by chooseLanguage until the rollout is ready. Do not flip this flag to pretend the task is complete.
- LANGUAGE_OPTIONS lists all five language names in their own scripts and per-language directions. AVAILABLE_LANGUAGES filters by readiness.
- app/language.tsx and app/settings.tsx prepared for new options; existing he/en retained.
- lib/plannedLanguageGlossary.ts: 13 terminology entries per new locale.
- lib/plannedUiTranslations.ts and lib/plannedAdditionalTranslations.ts: 553 total matching draft UI entries per new locale.
- lib/plannedLegalTranslations.ts: 164 draft entries per new locale, including all entries in existing LEGAL_EN dictionary, primary disclaimer and footer. These are authored translations, NOT independently certified linguistic/legal review.
- lib/legalLocalization.ts: localizedLegal preserves he/en behavior; new locales throw on unknown legal copy instead of silent English fallback. localizedLegalDate handles the two existing policy dates explicitly.
- components/LegalScreen.tsx: locale-aware legal lookup, RTL for Arabic, translated titles/dates. Primary legal notice uses legacy English as canonical source for new locales and resolves to translated draft.
- components/LegalLinks.tsx: RTL-aware legal links and localized footer disclaimer.
- docs/localization-review.md documents reference URLs and outstanding risks.

## Actual coverage at handoff
Run node scripts/check-new-locale-coverage.mjs.
Remaining statically identifiable literal t() English keys: 541 PER new locale.
Remaining keys from existing LEGAL_EN dictionary: 0.
Dynamic t() calls requiring separate work: 62.
These counts DO NOT cover every possible data-driven display string or establish language quality.
There are 553 translated draft UI entries, 13 glossary entries and 164 legal draft entries per new locale.

## Outstanding work
1. Finish 541 literal interface keys per locale, with contextual review.
2. Resolve 62 dynamic translation expressions; templates, fragments, interpolation, pluralization and whitespace need care.
3. Localize data-driven Career/SBC/gallery/mini-game questions, country/club/nation/league identities, dates, numbers, error helpers and labels. Most helpers still take legacy he/en. New locales must not silently route all content through English.
4. Migrate RTL-only layout conditions carefully to isRTL; do NOT mechanically replace language==='he' in text-content branches (that would show Hebrew in Arabic).
5. Remove/replace binary he/en toggles in components/SiteNav.tsx and components/AccountForm.tsx. User wants settings-based language changes and full five-language selection.
6. Review legal translations against authoritative original Hebrew; current drafts were based on existing English LEGAL_EN translations. Check policy text reflects actual implemented behavior. Accessibility text still says Hebrew/RTL only, matching old source, and needs a deliberate update once all five locales are truly supported. Account deletion page has UI t() strings outside legal dictionary. Consent modal and cookie notice still need complete new-language UI translation.
7. Full linguistic review in all three languages; terminology references only validate some terms, not all sentences. Do not claim professional/legal accuracy from machine checks.
8. Browser/mobile QA of every screen in every locale, first-run picker before registration, persistence, settings changes, consent, long legal copy, Arabic bidi, fonts, clipping and small screens.
9. Only enable new languages after complete coverage and review. Recheck current prod, reconcile changes, run required checks/export, and release only once ready under user's authorization.

## Checks
- npm run typecheck passed after final component changes.
- npm run verify:localization passed: preserves 20,198 player identities, football labels, 66 SBCs and 896 generated mini-game prompts in existing he/en. This does not validate all NEW-language dynamic content.
- node scripts/verify-new-locale-drafts.mjs passed: matching dictionary keys, nonempty translations, no Hebrew in new locales; legal numeric-token and email preservation; actual legal JSX props resolve in all three new locales; unknown new-locale legal copy throws; existing Hebrew copy preserved.
- Targeted ESLint passed for edited legal components/helpers/dictionaries/check script.
- npm run verify:catalogue passed with 20,198 unique cards.
- Full npm run lint was run earlier and failed with 53 errors and 22 warnings in pre-existing unrelated components. Do not claim full lint passes or broadly refactor unrelated components.
- No completed browser QA, no production deployment, no mobile OTA for localization.

Useful scripts:
node scripts/audit-new-languages.mjs
node scripts/check-new-locale-coverage.mjs
node scripts/check-new-locale-coverage.mjs --require-complete
node scripts/verify-new-locale-drafts.mjs
npm run typecheck
npm run verify:localization
npm run verify:catalogue

## Reference sources consulted
Official EA Arabic/Spanish/Brazilian Portuguese glossaries and Portuguese token/PlayStyles docs, URLs recorded in docs/localization-review.md. Do not say all text was independently cross-checked.
A trial public translation endpoint request for a generic phrase returned 429 and was not used to generate translations.

## Access/local workspace caveats
Prior local folder /workspace/scratch/070bf9e6f851/fc27 may not survive; open remote branch as authoritative checkpoint.
Local Git history differs from GitHub connector's per-file commits; do not force push it. Direct git push failed for missing GitHub credentials. Use connected GitHub tools for remote source operations or an appropriately authenticated checkout. User explicitly authorized this branch storage after an earlier automatic approval rejection.
An unrelated hidden temporary asset appeared locally; it was not staged, changed or uploaded.
No credentials are in this document.

## Other verified session facts
Supabase project hxjgphhcspzjnkkzdmpk: last queried auth.users count was 112 registered, 0 anonymous, 0 created that day in Israel time. This is historical and should be re-queried for a fresh count.
Player comments are shared by player ID, with original user-written text and no automatic translation. User asked about FUTBIN; its comment-language implementation was not reliably established. Shared community with optional translate action was suggested, NOT implemented or included in this scope.

## Continuation after handoff
- Removed legacy binary switches in AccountForm and SiteNav; registration retains its change-language link, and settings remains the post-registration selector. Both use isRTL for layout; consent text in AccountForm aligns with direction.
- Added draft new-locale copy for registration, settings and cookie notice. CookieNotice uses isRTL for layout and preserves the Hebrew-specific bidi branch; its headings and body now use translatable literal strings for new locales.
- A targeted dictionary inspection found matching keys across all three additional dictionaries (390 each) and no missing literal t() keys in AccountForm, settings or CookieNotice, accounting for the existing glossary. This is not a linguistic, visual, runtime or complete coverage check.
- Local clone could not be obtained in this environment; typecheck, lint, catalogue and localization verification were not rerun. Remaining handoff work, including dynamic consent modal text, all other screens and full review, still applies. NEW_LOCALES_READY remains false. No production deployment was made.

- Subsequent continuation: added draft consent-modal translations, changed its layout to isRTL while keeping Hebrew-only bidi text conditional on language === 'he', and replaced the dynamic greeting with a translated {name} template. Targeted inspection found all literal t() English keys in the modal in the draft dictionaries and the placeholder in all three translations. The additional dictionaries now have 401 keys each. Full runtime, typecheck, lint, linguistic and visual verification remain outstanding; the broader dynamic-content work remains incomplete.

- Further continuation: added account deletion page and email-body draft translations and changed its layout to isRTL. The additional dictionaries now contain 409 matching keys per locale; targeted inspection found no missing literal t() keys on that page. TypeScript transpilation reported no syntax diagnostics for AccountForm, SiteNav, CookieNotice, TermsConsentModal and delete-account; the additional dictionary parsed without duplicate keys. These are not typechecks or runtime/linguistic checks. A separate older local checkout exists at C:/Users/aviel/Documents/Codex/one-club-prod-audit; it is not the authoritative feature branch and must not be used to replace production.

## Further continuation: literal UI, generated labels and countries
- The latest literal t() audit reports 0 missing literal UI keys per locale and 22 dynamic t() calls for separate review (this audit does not cover all text or content). Draft dictionaries contain 1,218 matching UI entries per locale plus 13 glossary and 164 legal entries. Several dynamic templates, known errors, structured field/screenshot errors and countdowns were localized; unknown errors and many legacy he/en data helpers still require work. Some of the remaining 22 dynamic calls are already covered by dictionaries, but require deliberate audit rather than automatic dismissal.
- All 43 unique Season 2 objective descriptions have draft translations and coverage checks; objective titles and other data still need review. Added 249 CLDR-based country names per locale and search; country picker, session display and Grounds search use locale. These names and all translations remain subject to linguistic review.
- Reconstructed source and data locally, checked blob identity against branch (before subsequent targeted changes), using dependencies from an older checkout. Typecheck passed, verify:catalogue returned 20,198 unique cards including 51 recent editions, verify:localization passed for existing he/en and 896 mini-game prompts, and verify-new-locale-drafts passed with placeholder, structured-error, country and countdown checks. This reconstructed environment is not a clean installation. Full lint was attempted but interrupted after hanging; targeted lint found pre-existing hook errors in PlayerDossier and TermsConsentModal. No browser/mobile QA or new-language end-to-end verification has been completed.
- New locale readiness is still false. Never promote this older draft wholesale; recheck exact current production and reconcile only approved localization changes when ready. Significant remaining tasks include Career/SBC/gallery/mini-game data, club/nation/league and error helpers, all layouts and RTL, legal accuracy, linguistic review, end-to-end QA and release checks.

- Later work: football nation display now supports draft locales using the country names and explicit catalogue aliases, and the player filter, dossier, Career scouting and grid use the full locale. A catalogue audit found 207 unique nation values and zero unresolved names against the country data and aliases; this is a mapping check, not linguistic review. Existing he/en localization and 896 mini-game verification passed after updating the grid binding test. Current literal UI draft coverage has zero missing strings, with 20 dynamic t() calls still requiring audit; matching draft dictionaries contain 1,232 UI keys per locale. Unknown runtime errors, other data-driven strings, Arabic layouts, complete linguistic/legal review and screen QA remain unfinished. Languages remain hidden.

- Subsequent mini-game work: fixed questions and 17 generated question patterns now have draft translations; feedback and mistake counts are translated. The 896-prompt test now checks all three locales for Hebrew/English fallback and preservation of numeric tokens in generated prompts; it passes alongside existing he/en checks. This is not an independent linguistic or screen review. Current draft UI dictionary contains 1,261 matching entries per locale. Locale remains unavailable: other data-driven content, unknown errors, screen directions, legal and linguistic review, and browser/mobile QA are still incomplete. Typecheck passed in the reconstructed environment after this work; existing localization and catalogue checks passed as previously described. Generated prompt content should receive contextual football-language review before release.

- Additional work: seeded Career challenge titles, rules, proof requirements and labels are translated and use the full locale in the challenge screens. User-authored challenges retain their original text. Draft verification now checks each seeded Career translation and user-content preservation. Latest reconstructed-environment typecheck and verify:localization passed; dictionary checks passed with 1,278 entries per locale. The SBC data and generated rule labels, many other screens, localization quality and end-to-end QA remain outstanding; languages remain hidden.

- SBC work started: 24 reward labels were translated and sbcText accepts the draft locale while preserving community-authored text. The coverage audit now separately checks the built-in SBC dictionaries: 81 of 106 unique SBC strings still lack a draft translation per locale, and generated rule labels also remain. Current audit: 0 missing literal t() keys, 20 dynamic calls, 81 missing built-in SBC strings. --require-complete correctly fails. Draft dictionaries contain 1,302 keys per locale; typecheck, existing localization and draft checks passed in the reconstructed environment. Languages remain hidden and no release was made.

## Latest SBC continuation
All 106 unique built-in SBC dictionary strings now have draft translations (audit reports 0 missing in each locale). Added a numeric-token check over those translations, accounting for thousands separators. Generated SBC rule labels now support the new locales, with automated checks of every built-in challenge and all 25 classic segments against empty and filled squads; test coverage is not a linguistic or visual review. User-authored copy remains unchanged. The UI literal audit still reports 0 missing, and 20 dynamic t() calls remain to audit. Latest typecheck, verify:localization and catalogue (20,198 cards, 51 recent editions) passed in the reconstructed environment; the very last direction-only edit in SbcClassicSolution still needs a fresh check. New locales remain hidden. Other data-driven copy, unknown errors, RTL, accessibility, legal/linguistic review and browser/mobile QA remain unfinished; never promote this branch wholesale over production.

## Latest continuation: SBC titles and Grounds
- Built-in SBC descriptions and rewards: 0 missing among 106 unique strings per locale. Numeric tokens are checked, including thousands separators. Generated rule translations are connected and tested against every built-in challenge and all 25 classic segments, with empty and filled squads. SBC titles are translated on list, detail, calculator, upload and home; explicit unchanged player names and event brands are checked. Arabic direction and localized countdown/date formatting were added to SBC list/details.
- Grounds profile creation now uses the full locale for all 68 dictionary labels, with category/count translations and RTL layout. User-authored text remains original. Runtime errors on registration, profile, Career, SBC, Ultimate and admin screens use localized known/structured messages; unknown errors in new locales show a generic localized message. Existing he/en helper behavior remains; English registration errors now use English rather than the prior Hebrew default.
- Current audits: 0 missing literal UI keys, 0 missing built-in SBC dictionary strings, 10 dynamic t() expressions still flagged for manual verification; multiple are covered by dedicated tests. 1,498 UI draft entries per locale; legal and other data still need review. Latest reconstructed typecheck, draft and existing localization checks passed; catalogue last confirmed 20,198 including 51 recent editions. No production deployment or complete browser/mobile QA. Names of individual PlayStyles, other data-driven labels, full RTL, legal/linguistic review and unknown edge cases still need work. NEW_LOCALES_READY remains false.

## Latest continuation: PlayStyles and scouting
- Added 36 Grounds PlayStyle display names, with 35 mapped to EA's localized FC 27 article and Power Shot to EA Help; Rush Out and older scouting-only names are descriptive drafts requiring review. Names now display in Grounds, player dossiers and Career scouting. Coverage checks include 93 distinct catalogue/scouting variants and preserve existing he/en names. Source references are in docs/localization-review.md.
- Career scouting role, tactical summaries, contract duration, detailed attributes, preferred foot and wage period now use the full locale. Coverage checks found 62 role names and all attribute labels. Scouting role wording remains draft; numeric and date formatting throughout the app, remaining layouts and other data-driven content need review. UI draft dictionary last checked at 1,623 entries per locale. Typecheck and localization checks passed in the reconstructed environment before the latest isolated wage-label edit; rerun after synchronizing current source. Shaping and visual QA are still required, NEW_LOCALES_READY stays false, and no release was made.


### Additional continuation: direction and scout details

- Added draft translations for scout roles, tactical styles, detailed attributes, preferred foot and contract duration; covered 62 role types in the supplied scouting data. Wage suffixes for the three planned locales are localized. These remain subject to professional linguistic and in-game review.
- Updated layout direction to use the locale-aware `isRTL` in Arrival, AuthorNote, PlayerFilter, FutzBetaDownload, CommunityActivityUI, CommunityBoards, SbcSurface, Market, Games, Gallery, Career and GalleryTokenPlanner. Planner dates now use the selected locale while preserving the previous Hebrew/English formats. Review visually on web and mobile, especially mixed-direction football names and numbers.
- Draft verification reports 1,623 UI strings, 13 glossary entries and 164 legal entries per new locale. The most recent literal coverage audit found zero missing static calls and zero missing built-in SBC descriptions; 12 dynamic calls still require individual review. A reconstructed local environment passed localization and catalogue verification with exactly 20,198 unique cards. It uses dependencies from a previous checkout, not a clean install; visual QA, full lint, translation/legal review and remaining dynamic/data-driven strings are still required. Do not set `NEW_LOCALES_READY` to true or modify production until all required review is complete.

- Further direction fixes cover SbcPointsSolution, RecentCardInfo, NoticeHost, MobileTabBar, HomeSeason2Overview, GalleryUI and the Gallery detail screen. CommunityActivityUI's `CommunityError` still selects its error text using the legacy Hebrew/English `language`; localize that data-driven map and its alignment before rollout. Other remaining `language === 'he'` checks require classification as content, locale formatting, or direction before changing them.


### Continuation: community errors and dynamic coverage

- `CommunityError` now uses the translation function and locale-aware direction; all 12 mapped errors have draft translations in Arabic, Brazilian Portuguese and Spanish. The draft verifier extracts the error map and checks every entry and numeric value. This resolves the CommunityError issue noted above.
- Added locale drafts for player foot labels and author attribution, and connected the affected components. Grounds PlayStyle category keys now have a data-derived coverage assertion. Draft verification passes with 1,624 UI strings, 13 glossary entries and 164 legal entries per locale; typecheck passes in the reconstructed environment.
- Literal coverage reports zero missing UI or built-in SBC strings. Thirteen syntactically dynamic calls remain flagged, including the now-tested community error map and Grounds categories; the count is not a count of missing translations. Continue checking dynamic sources, such as the chat day labels and other legacy language branches, and perform linguistic, legal and visual review before enabling any new locale. Production remains untouched.

- Chat day separators now translate Today/Yesterday and format earlier dates with the chosen locale, retaining the prior Hebrew and English date formats. Draft verification now checks 1,626 UI strings per locale.


### Continuation: career, community and Grounds labels

- Localized career submission states, Gallery's community-member fallback, membership labels and month names on community boards, player filter selected types/nations, and Grounds player positions, intents, divisions and country labels. Preserved legacy Hebrew/English display behavior where explicitly checked. Market pagination uses locale-aware direction and Gallery dates use the selected locale.
- Draft verifier now checks the source maps for player-filter kinds and Grounds positions, in addition to community errors and Grounds categories; approved unmodified brand labels are allowed. Drafts: 1,637 UI strings, 13 glossary entries, 164 legal entries per locale. Typecheck and draft verification pass in the reconstructed environment. Literal audit shows zero missing UI/SBC entries and 19 syntactically dynamic calls, some covered by these data-driven tests. This does not establish complete translation or review: continue audit and visual, linguistic and legal checks before rollout.

- Added Grounds skill/level captions, localized elapsed time on player comments (with a fallback for devices without `Intl.RelativeTimeFormat`), and locale-aware number/date formatting on market, SBC builder and career journeys. Draft verifier now reports 1,640 UI strings per locale, with zero missing static UI/SBC entries and 19 dynamic call sites requiring source-by-source audit.
- Attempted browser QA using the reconstructed local checkout, temporarily enabling languages only in that disposable local copy. Expo reported it was listening on localhost:8091, but both browser and local status requests timed out; no visual QA was completed. The local flag was restored from the branch afterward. The branch flag remains false and production was not modified. The reconstructed checkout reuses older dependencies and is not a clean checkout; investigate the Metro startup/network environment and missing assets before retrying browser QA.


### Continuation: data-driven season labels and local web build

- Added draft translations for all currently supplied Season 2 objective titles, dependency headings and acceleration values, keeping official event names identifiable. The verifier reads the Season 2 data and checks every heading and acceleration in all three locales. It also verifies all conditional navigation labels. Drafts now contain 1,651 UI strings per locale.
- Reconstructed 179 missing assets from older local checkouts, comparing each Git blob hash with the current branch tree before copying. All missing branch assets were restored in the disposable test copy. `npx expo export --platform web --output-dir ../web-export` then completed successfully, bundling 1,679 modules and 516 assets. This is still a reconstructed dependency environment, not a clean install.
- Visual browser QA remains incomplete: Expo and an exported static server both reported listening locally, yet the browser and local requests timed out. A request to bind a server to all interfaces was rejected by automatic review because it could expose the private bundle; a localhost-only static server was tried instead but was also inaccessible. Servers were stopped and the local rollout flag restored from the branch. Do not expose the bundle broadly or enable locales in production; retry visual QA in a suitable local development environment. Linguistic/legal review and unresolved dynamic content still remain.


### SBC: Héctor Bellerín, 28 October 2026

- Added the Ultimate Scream Bellerín player SBC, target 30,000 Item Score, minimum player rating 45, expiry 3 November 2026 at 18:00 UTC, with a 85 RM/RB reward. Reward is represented in the SBC UI without adding a new catalogue card. Sources and checked timestamp are in `assets/data/sbc-bellerin-20261028.json`.
- Added five source-cross-checked base-item combinations, validated for PS/Xbox and PC, and player alternatives. User-visible notes explain the 30-item per-submission limit, saved partial progress, and historical 26 October optimizer price snapshot; displayed prices remain estimates. Five paths cover 4, 5, 6, 7 and 27 items; additional computed and distinct-item options remain available. `scripts/verify-bellerin-sbc.mjs` verifies totals, eligibility, translations, both platforms and preserved catalogue count.
- Changes remain on this work branch; new language rollout remains disabled. They are not deployed to production.
