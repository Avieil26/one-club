# New player releases — verified checkpoint, 24 October 2026

## User request and delivery status
Add missing player item versions released on 23–24 October, with the correct actual card frame/art, full real attributes and edition-specific console/PC prices. Preserve current features and all previous cards. Deliver a tested Preview before production. Do not build an APK or deploy production as part of this task.

NOT FINISHED: No ready Preview has been delivered. No production changes have been deployed. Do not tell the user this is complete.

## Durable source and implementation
Repository: Avieil26/one-club.
Implementation branch: work/new-cards-implementation-20261024
Implementation commit: 8efc71a8c03709e636e7589841aea2f83ce7f8a7
Implementation tree: a56d047b92191424a4bfd9c478cb72b19c058221
Parent/current-app base: 59449f02327f15718ac504a67336a7e4fe58dac8 (build/play-store-aab-20261023).
Source-only backup: work/new-cards-source-20261024 at 50e03996da610502f2d7e3dda9101247762f67ef.
Do not use the stale local one-club directory at 9800b2d.

The implementation checkpoint intentionally needs completion before it can build: lib/recentCardArt.ts requires 51 PNG assets that have not yet been attached to its tree; package.json references scripts/verify-new-cards-20261024.mjs which has not yet been attached. Local filesystem edits and tests were lost when the workspace reset. GitHub checkpoint is the source of truth.

## Research already completed
51 missing versions: 41 Ultimate Scream / Ultimate Scream Hero and 10 Star Performer versions.
Source list: https://www.futbin.com/27/latest (first 51 entries from October 23–24; following 29 October 22 Season 2 entries already exist).
Each exact EA item ID and face stats were independently matched to the individual FUT.GG item page. Full 34 attributes, foot, weak foot, skill moves, PlayStyles, original card-image path and normal/holographic/pristine flag were extracted per item.
All normalized data, source URLs, reference URLs, art URLs and per-platform price snapshot are durably saved in assets/data/recentCards20261024.json (51 rows). Do not reconstruct/fabricate these values or substitute a base card's stats/price.
Card IDs are recent-<EA item ID>; edition is recent; family and holographicType distinguish actual promos.
Prices were checked October 24, timestamp stored per row. They are snapshots, not guaranteed live.
Market quotes came from independently decoded R2 FUT.GG price files. Status 0 is market; status 1 is SBC completion cost; missing/zero quotes remain null. Emre Mor 50562888 and Woltemade 67362886 have SBC costs, not market prices.
Some source objective flags conflict with real positive market quotes (e.g. normal Tahith Chong); do not infer untradeability from those flags.
No competitor branding should be shown in the product. Sources in developer data are fine.

## Saved code changes
- lib/fcPlayers.ts appends RECENT_CARDS after the prior catalogue.
- lib/recentCards.ts exposes precise card/meta lookup.
- lib/recentCardArt.ts maps all 51 exact item IDs to local assets/images/cards/recent/<itemId>.png.
- PortraitCard renders original full-card artwork for recent editions.
- PlayerDossier uses exact recent full attributes/face/foot/height, hides base-edition switches and fictional potential projection for these versions.
- RecentCardInfo separates SBC estimates, market availability and dated card verification; HE/EN.
- New releases filter and visible October 23–24 button in player catalogue.
- marketPrices.ts derives recent market snapshots from recent JSON, keeps absent values undefined for display.
- api/market-prices.js independently decodes console and PC item sequences, excludes SBC costs, maps exact recent item IDs and emits [0,0] for unavailable recent market quotes to clear stale values.
- Existing large marketPrices.json and priceEaIds.json were deliberately left unchanged; recent mappings are derived from recent JSON.
- Previous preservation tests updated to include 51 recent editions without weakening old-catalogue preservation.

## Required remaining work
1. Fetch/check out implementation commit into an isolated worktree. Read AGENTS.md.
2. Restore all 51 original card assets by downloading each row.artUrl into assets/images/cards/recent/<itemId>.png. The URL ends .webp but currently returns PNG with curl Accept */*. Check content, not URL suffix.
   Download atomically to temporary files. Verify complete PNG including IEND/footer and decode with Pillow or equivalent. Three early interrupted downloads had valid headers but truncated bodies; those were caught and repaired locally. Never trust just file size or header.
   All 51 complete originals were successfully downloaded and decoded locally before reset, so these source URLs are known to work. Hero assets are larger than others.
3. Add the missing verification script referenced by package.json. Critical invariant:
   Before: 20,147 runtime cards.
   SHA256 of JSON.stringify(PLAYERS excluding edition recent):
   67e3a91626725de737c61a053b7c389403601cb4b4a711453b23d3bc3f07fe5f
   After: 20,198, all IDs unique; recent count 51.
   Original 20,118 preservation hash remains enforced by verify-season2.mjs.
   Verify 34 attrs per item, exact IDs, all artwork decodes, missing prices not free, SBC costs excluded from market quotes.
   Useful mocked API fixture:
   index id0=50562888 d=[50333827,16777216]
   console same IDs p=[31320,6400000,0] s=[1,0,0]
   PC id0=100896715 d=[16777216] p=[14000000,0] s=[0,0].
   Expect recent-100896715=[6400000,14000000], recent-117673931=[0,0], recent-50562888 absent.
4. Run typecheck, preservation/build checks, web export and Android JS export. Full repository lint baseline is 53 existing errors and 22 warnings; earlier runs had no increase. New helper files and price API linted cleanly. Some existing market/PlayerDossier effect lint errors remain pre-existing; avoid unrelated broad refactors.
5. Run actual visual/interaction QA. This has NOT been completed. Existing scripts/verify-season2-ui.mjs provides a working Playwright harness with isolated synthetic session, mocked Supabase requests, HE/EN, a local dist server and no real user writes.
   Verify new filter/search, all 51 detail routes, loaded artwork, exact edition navigation, SBC cost vs market price labels, all variants, widths 360/390/1280 and no document overflow/card clipping.
   Earlier local Chrome launch was blocked by sandbox ProcessSingleton sockets; use GitHub Actions Ubuntu + Playwright rather than wasting time repeating local browser flags.
   A prepared but unattached workflow blob exists in GitHub: 46d184330045b8db1f679c378660f039911d27ba. It references scripts/verify-new-cards-ui.mjs which must be implemented. Add PR triggering if needed; draft PR is authorized. No subagents were requested.
6. Attach all assets and tests to a final candidate commit, preferably preview/new-cards-20261024. A number of asset blobs (at least first 36 sorted item-ID filenames) were uploaded to GitHub Git storage, but are not attached to a tree. Re-downloading and hashing locally is simplest; create_tree will identify missing blob SHAs if reusing them.
7. Only after checks, give the user the exact Windows CMD Preview command with final SHA. Do not claim an existing Preview URL. Vercel connector previously returned team 403; usual user-driven CLI works:
   cd /d "C:\\Users\\aviel\\Desktop\\fc27-preview-20118-20261019" && git fetch origin && git switch --detach <FINAL_SHA> && npx vercel --environment preview --project fc27-israel --scope avielindapurkar717-9878s-projects

## Checks actually observed before workspace resets
Full 51-source cross-check passed.
20,147 prior runtime objects/order unchanged; 20,198 total verified.
TypeScript passed; web and Android exports passed locally on the initial complete integration.
Mobile layout and native-startup regression checks passed.
All 51 PNG files fully decoded/checksummed after fixing three partial downloads.
Separate-platform market API fixture passed.
Visual screen QA and final complete remote candidate remain unfinished.

The user is frustrated by repeated progress claims without a deliverable. Be candid, avoid repeated generic updates, and work directly toward a complete reviewable Preview. Workspace resets caused recovery work; persist final work in GitHub instead of relying on scratch or running exec-cell memory.
