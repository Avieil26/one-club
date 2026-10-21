# Gallery preview

Based on production f8802af57d41842983a15e758330c40127da3393. The player catalogue and SBC data are unchanged.

The Gallery contains all 128 current set definitions, exact D/C/B/A/S thresholds, individual rewards and the original Gallery Token icon. It loads independent per-set item pools on demand; these files are excluded from the SPA rewrite and are not fetched during startup. Plans begin empty. Users can search exact editions, mark Collected and First Owner, compare the top ten scoring bonuses, and save their plan on the current device. Prices are console snapshots, explicitly dated and never replaced by zero when unavailable.

411 distinct source lineups are retained after checking 493 lineup calculations against independently implemented score and tag rules. Four duplicate-item source lineups were rejected. Calculated validation is deliberately distinguished from in-game proof and administrator approval. Imported options do not claim live market optimality or console verification.

Community submissions require an eligible complete unique-item set and private in-game screenshots. RLS shows pending submissions only to their author and administrators. Insert triggers override forged approval fields. Only the server administrator check may publish or revoke a solution; approval records reviewer and time. Uploading awards no XP or reputation. Pending and rejected screenshot objects remain private. Administrator review is available both in the existing approval queue and on the collection community tab.

Data sources used for checking: EA Gallery help, FUTBIN Gallery catalogue and the public FUT.GG Gallery catalogue/item pool responses. In-game names, score thresholds, reward amounts and item identity facts are preserved; no competitor brand labels appear in the product UI. The reproducible importer cache is intentionally not committed. Normalized public data and the calculation audit are committed.

Validation: `node scripts/verify-gallery.mjs`, `npm run typecheck`, targeted ESLint, web and Android JS exports, `scripts/verify-gallery-review.sql` under authenticated/anon roles with rolled-back fixtures, and `scripts/verify-gallery-ui.mjs` in Hebrew/English at 390/1280 widths. Full repository lint retains pre-existing baseline failures, recorded separately. Web Preview must be reviewed before production release; no new signed APK is produced by this change.
