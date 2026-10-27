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
