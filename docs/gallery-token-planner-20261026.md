# Gallery token planner — Preview candidate

Built on the verified 195-set Gallery Preview, commit 5369a706e8f322a71ab6e82f580f484d17e597d9. Production release requires Aviel's review of the Preview. No APK or production deployment is part of this change.

Entry: Gallery → Open token planner (`/gallery/planner`). Choose an additional-token target with optional spending cap, or a coin budget. Manually select the highest grade whose rewards were already claimed. The planner reads collected-edition marks from this account's saved device plans. Guest and member keys are separate. Settings/progress can be saved on this device; reopening recomputes the route using the available snapshot. Refresh collected marks after saving a set plan.

The compact on-demand planner catalogue is about 212 KB and includes 195 sets and 682 independently checked lineup options. It is not loaded at startup. Exact EA edition IDs are used throughout. No account credentials, EA synchronization, purchases, reward claims or server writes are involved.

Five marginal-cost strategies propose a route, then select the cheapest target-reaching candidate or the largest token gain among candidates under budget. This is a heuristic among imported verified lineups, not a globally optimal solver and not a guarantee that a target is impossible. The UI says when the suggested route falls short. Each set appears once. Rewards already claimed are subtracted. Shared items are purchased once across the route; collected editions cost zero. Budget is gross buying-and-keeping cost, without hypothetical resale proceeds or tax assumptions.

Market quotes come from each platform file's own independently delta-decoded exact ID sequence. Only console status 0 and positive prices are accepted. SBC costs, unavailable quotes and unknown prices are null, never free. Those lineups can be considered only when their unpriced items were already marked collected. The dated snapshot is committed in assets/data/galleryPlannerMarket.json; scripts/import-gallery-planner-prices.mjs refreshes it deliberately. It does not run during app startup or deployment.

Each route step opens its precise lineup in the set page, with the chosen grade and a visible planner selection label. The existing explicit “View and choose lineup” action remains responsible for selecting the items. Existing unsaved plans are not silently overwritten by merely opening a route link.

Checks: pure scenario tests for overlap, claimed grades, owned items, missing/SBC prices, zero budget, impossible targets and account keys; exact matching of all 682 options to their source lineups; HE/EN browser checks at 360/390/1280 for entry, route, save/reload, exact-lineup handoff, progress, collected refresh, invalid inputs and overflow. Typecheck and focused lint are required. Existing full-repository lint baseline remains 53 errors and 22 warnings.
