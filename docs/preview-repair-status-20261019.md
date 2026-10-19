# Preview integration — 2026-10-19

The uploaded current source `fc27-current-source-20261019-165707.zip` identifies its Windows base as `3b2416467ed419ae1a875333f2fab4341c1023dd` on `grounds-prod-safe-20261014`, including uncommitted local changes. The original archive is unchanged.

The integration combines that current source with the latest English/Star Performer fixes on `fix/continue-preview-20261019`. It does not merge into Production or apply SQL to a live database.

## Catalogue recovery

The incomplete Preview was missing 23 TOTW cards and all 15 DFG Team 2 cards. Their exact identities and data were recovered from the current source, rather than manufacturing rows to meet a count. Existing promo rows shared by both sources have identical data.

The actual app export now has **20,118 cards with 20,118 unique IDs**:

| Edition | Cards |
| --- | ---: |
| Base, including icons | 19,887 |
| Hero | 87 |
| TOTW | 92 |
| Destined for Glory | 30 |
| Future Stars | 15 |
| Star Performer | 6 |
| Ones to Watch | 1 |
| Total | 20,118 |

Regular cards are preserved. Metadata, edition prices and item IDs are merged alongside the restored rows. A fixture pins the 38 recovered identities, ratings and positions. Catalogue, preservation and localization checks run before Vercel/CI exports.

## Preserved features

- Current Grounds creation form, 36 PlayStyle assets and Base/Plus selections, optional archetype, distinct 1–50 archetype level and 1–5,000 Skill Rating.
- Full-profile navigation, follow behavior, local social changes and backend RPC fields.
- Existing source schema and migrations are retained as files; none were applied to a remote database.
- Approved Future Stars frame, OTW renderer, DFG Team 2 art mapping, promo detail switching, edition metadata and SBC Pina.
- Latest English copy and language-aware layout remain available, including the restored Grounds creation form. Champions stays visible with its supplied background; public demo admin shortcuts remain removed.
- Precomposed TOTW artwork is not globally scaled, so restoring its renderer does not enlarge every foreground element.

## Validation

- Actual catalogue: passed at 20,118 unique IDs, with preserved regular rows and expected promo ratings/positions.
- Preservation checks: passed for all 38 recovered identities, 36 PlayStyles, valid Grounds submissions, separate Skill Rating/level, and rejection of invalid/anonymous submissions.
- TypeScript: passed after integration.
- Guarded web export: passed after integration.
- Full ESLint run reports existing/restored source debt (85 errors, 53 warnings at the initial integrated check), mainly React compiler hook/ref rules. This is not a clean lint result. New Grounds form/PlayStyles code compiled successfully; unrelated hook rewrites were not included in this recovery.
- Browser visual QA could not complete: no local browser binary was available, its download failed, and the cloud browser could not reach the workspace's local server. No visual pass or live backend test is claimed.

## Star Performers and language follow-up

The user supplied the approved orange crystal reference after inspecting the first Preview at `https://fc27-israel-6vxtyn33a-avielindapurkar717-9878s-projects.vercel.app`. The shared Star Performer background now uses a faceted orange/gold surface, a thin angular illuminated frame and the small crown/star at the top. The player-free SVG review is in `preview/star-performers-frame.svg`.

All six Star Performer cards use this background. Player data, item-specific portraits, rating, position, name, flag, badge and stat layout remain unchanged. The foreground JSX/styles after the SVG were compared byte-for-byte against the previous commit; catalogue and promo data files are unchanged by this follow-up. Hero and TOTW keep their previous paths.

English presentation now covers player and icon names (including names supplied by media metadata), player page navigation, market filter nations/leagues/clubs, built-in Career challenge titles/rules/proof, status and image labels, create/submit screens, SBC copy, comments, squad building and related dialogs. Known local validation messages also have English translations. Both language options remain available, original Hebrew and stored identifiers remain intact, and community-authored text is preserved.

The Israeli scouting filter was removed without removing the Israeli players from the full list.

`verify:localization` checks all 20,118 player names and football identities, all built-in Career challenges, all 36 catalogued SBCs, language options and literal UI copy (including resolution through the legal/Grounds translation boundaries). It passes alongside typecheck, catalogue and preservation guards and the web export. Full ESLint still reports the pre-existing 85 React compiler/hooks errors; comparison against the integration baseline found no additional errors by file/rule. The new background, translation helpers and localization guard pass focused lint.

The user deployed the Star Performer/English follow-up (`32a3447`) successfully through the Windows CLI at `https://fc27-israel-oa2jm1gih-avielindapurkar717-9878s-projects.vercel.app`. The connected Vercel tool returned 403 for the intended team/project, so no live visual review or new deployment is claimed here. The PR remains a draft for Preview review.


## Mini-games question language follow-up

The game screens already translated their headings, but Guess Who displayed the Hebrew question returned by the engine, and the Grid/Which Club/Draft screens displayed untranslated football identities. `miniGameLocalization.ts` now translates the actual generated questions, including compound club/nation/league, position, rating, foot, Icon and historical conditions. RoundNote handles the full mistake-message family. Grid and Which Club display localized clubs/nations; Draft displays English manager names and leagues when English is selected.

Question keys, answer predicates, random selection, game state, lives and scoring are unchanged. The engine modules and card data are unchanged. Questions and feedback are translated at render time so a language change does not reset the round or leave feedback in the previous language.

The localization build guard now enumerates all private question factories in an isolated test module, without adding production exports. It checks 896 distinct prompts from all difficulty tiers and literal history/fallback paths, bilingual output, mistake messages, club/nation choices, draft managers and the screen bindings. Sample generated rounds still contain nine players and both correct and incorrect answers and are not mutated by localization. TypeScript, guarded web export and existing preservation/catalogue checks pass. Full lint reports the existing 85 errors and 48 warnings; no additional error counts by file/rule were introduced, and the new helper/test pass lint. This mini-games follow-up still needs a Preview deployment and live review.
