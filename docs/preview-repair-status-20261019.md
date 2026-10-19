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

Regular cards are preserved. Metadata, edition prices and item IDs are merged alongside the restored rows. A fixture pins the 38 recovered identities, ratings and positions. Both validation scripts run before Vercel/CI exports.

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

## Remaining design review

Star Performer data and item-specific portraits are retained with the orange-shield renderer from `preview/star-performers-20261018`. The later reference screenshot from the earlier conversation is absent from both uploaded archives. Matching to that exact screenshot remains unverified, so this PR stays a draft pending design review and Preview smoke testing.
