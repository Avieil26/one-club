# Preview repair status — 2026-10-19

Base: `preview/fc27-20118-orphan-promo-cards-fix-20261019` at `5720e31ff0c323e779510499e32c04c8d8d75b7f`.

This is an unfinished Preview candidate. Do not merge or release until the catalogue and design blockers below are resolved.

## Repairs

- Carried forward missing English copy, accessibility labels and full-word translation matching from `preview/final-integration-20261019`, while keeping Champions accessible without its old “coming soon” gate.
- Restored English roster names and DFG promo face stats.
- Standard promo card rendering now prefers the promo's stats; an explicitly requested base card still uses base stats.
- Restored language-aware shared layout, fields, arrival, sign-in, beta download and community board copy. Grounds region labels now translate without changing user-entered content.
- Catalogue validation executes the actual `PLAYERS` data modules, checks unique IDs, preserves regular rows and verifies special-card identities, ratings and positions.
- The existing workflow checks the catalogue before export. Vercel's build command now invokes the same guard.

## Catalogue blocker

The real exported catalogue contains **20,080 unique cards**, not the requested **20,118**. The old validator also failed at 20,080; orphan recovery adds zero rows because every paired TOTW, Future Star and Star Performer already has a base row.

| Edition | Cards |
| --- | ---: |
| Base, including icons | 19,887 |
| Hero | 87 |
| TOTW | 69 |
| Destined for Glory | 15 |
| Future Stars | 15 |
| Star Performer | 6 |
| Ones to Watch | 1 |
| Total | 20,080 |

The missing 38 identities have not been identified from available sources. No rows were fabricated and the target was not lowered. `npm run verify:catalogue` and the guarded build intentionally fail until authoritative missing data is recovered.

The previously referenced Production commit `3b2416467ed419ae1a875333f2fab4341c1023dd` could not be retrieved from the Git remote. The current Vercel connection returned 403 for the specified FC27 team, and no authenticated local Vercel CLI was available. The original Windows working tree is not present in this environment. An archive of the verified current working tree or a reachable commit is needed to recover data that only exists there.

## Design blocker

The current Star Performer renderer is identical to the renderer on `preview/star-performers-20261018`: orange shield artwork with item-specific portraits. The later screenshot referenced in the conversation was not attached to this session or found among the available Library files, so visual matching against that screenshot remains unverified.

## Validation

- TypeScript: passed after integrating English fixes.
- Web export: passed after integrating English fixes; repeated after final region/stat changes.
- Repository lint: 65 errors and 30 warnings on the starting branch. The three changed files reporting errors retain the same counts as their baseline: Champions 2, Arrival 9, beta download 1. Other edited source/validation modules passed focused lint at the time of checking.
- Catalogue: intentionally fails, actual 20,080 versus required 20,118; uniqueness, regular-card preservation and all expected promo identities/rating/position checks pass before that failure.

No Production branch, alias, database or deployed site was changed during this repair.
