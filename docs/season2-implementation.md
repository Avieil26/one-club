# Season 2 catalogue update

Based on production commit `de9253d8458fc13d48ed70cadae897704a91bf1b` (same tree as remote `af11a1780cf48b2df16591b139331ec8786413f7`).

## Data and presentation

Added 29 unique player items from the 22 October 2026 data snapshot. They use independent `season2-<EA item ID>` catalogue IDs and bundled original card renders. All 20,118 previous catalogue objects and their order are SHA-256 checked unchanged. Total: 20,147.

Four populated background IDs: 103 (20 Heritage rewards), 134/135/136 (three additional retro item definitions each). The source retains old campaign names for these IDs; those stale names are not shown as current campaign names. The nine retro acquisition routes and in-game availability are explicitly unverified. An empty Ultimate Scream pumpkin asset and Season Ladder Excellence asset with zero associated players are excluded.

Every new item includes OVR, six face statistics, all 34 dossier sub-attributes plus source attributes, current card club/league/nation, position alternatives, foot, skill moves, weak foot, height, weight, age, acceleration type and PlayStyles/PlayStyle+. Role IDs are retained in the data without inventing role labels. Original images are bundled for web/native/offline use.

The home page links directly to the new Season 2 filter. Card detail pages use the new item's attributes and artwork rather than borrowing base-card statistics. The projection control is hidden on these cards so speculative potential cannot be mistaken for source data. No market quotation is borrowed from the regular card.

## Acquisition

Eight Standard and eight Premium pass items are mapped to the exact season levels and cumulative SP thresholds. For example Werner/Silas = Standard level 20 / 20,000 SP; Fekir = Premium level 20 / 20,000 SP; Rashford = Premium level 30 / 30,000 SP. Premium access is displayed separately from SP; SP is never shown as a coin price.

Four objective reward groups include bilingual summaries, all task descriptions and nested completion requirements: Olga Carmona (7 of 8), Alexis Sánchez (Circuit Tournament), St. Juste (three Circuit event groups with full tasks), Witsel (five Weekly Play completions; each requires scoring in five separate Daily Knockout matches). Source group deadlines are formatted in Israel time. All nine unmapped retro routes explicitly say availability/acquisition remains unconfirmed, without fabricated free/market prices.

Source conflict: generic player definitions have `isUntradeable=false` for Heritage rewards while objective reward descriptions explicitly state untradeable. The UI uses objective-specific wording only for those four groups; it does not infer pass tradeability or market prices from that flag. Null price / `coinCost=0` alone never establishes a free card.

Sources and exact per-card URLs, source attribute snapshots and original-art hashes are recorded in `docs/season2-data-audit.json`. This is source-data verification, not an in-game test.

## Validation

- `verify:season2`: exact IDs/OVR/backgrounds/sub-attributes/art hashes, all pass SP thresholds and objective translations; 20,118 prior objects unchanged.
- Existing catalogue, preservation, localization, community, SBC and Gallery data checks stay in place.
- Automated browser checks: home CTA → filtered catalogue → search → exact detail; all 29 routes, HE/EN at 360/390/1536, real bundled art and no horizontal overflow. Account/community calls are mocked in isolated synthetic sessions, with no account creation or database writes.
- A narrow English detail-page background overflow found by the UI test is fixed by constraining the route's root container, preserving native layout.
- No auth schema, migration, gallery data or APK changes.

Full-repository ESLint has the same pre-existing 53 errors / 22 warnings; new standalone modules/components pass focused lint. TypeScript and the web build pass.
