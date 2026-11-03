# FC27 content sync (preview-only)

This branch introduces a **review-only** ingestion pipeline. It does not modify the live players, SBC catalogue, card images, or Vercel deployment.

## Running
- Set repository Actions secret `FC_CONTENT_FEED_URL` to a trusted, HTTPS JSON endpoint for which content reuse is authorized.
- Optionally set `FC_CONTENT_FEED_TOKEN` for bearer authentication.
- Run `Stage FC content updates` manually on the feature branch to test (scheduled runs trigger only from the repository default branch after merge).
- The scheduled workflow checks every four hours (minute 17 UTC), runs safety tests, fetches and validates a payload, then stores a review artifact named `fc-content-pending`.
- With no configured URL, the workflow **fails closed**; it does not claim a successful sync.

## Feed schema
```json
{
  "source": "authorized",
  "sourceUrl": "https://provider.example",
  "cards": [{"id":"unique-card-id","name":"Player","program":"Ultimate Scream","rating":85}],
  "sbcs": [{"id":"unique-sbc-id","name":"Challenge","rewardCardId":"unique-card-id","requirements":[{"minRating":82}]}]
}
```

This is a transport/staging schema, **not** a complete production representation. Ratings, seven face stats, art rights/images, current prices, expiry timestamps, SBC segment requirements, and fully verified solutions still need provider mappings and validation before publication. Do not manufacture missing data.

## Safety gate before going live
1. Confirm the source license/API availability and map permanent external IDs to existing local card IDs.
2. Add a real catalogue adapter for `assets/data/players.json` and existing special-card metadata without decreasing its verified count.
3. Add SBC requirements, verified solutions, reward preview and exact expiry handling.
4. Check duplicate IDs, stale data, changed prices, art mappings and source timestamps.
5. Compare before/after card totals; block unexpected deletions and large shifts.
6. Build and visually verify the Preview; require approval before first Production roll-out.
7. Decide update strategy for mobile APK installations (static bundles will not refresh from a repository commit alone).

## Commands
`node --test scripts/sync-content-feed.test.mjs`
`node scripts/sync-content-feed.mjs path/to/authorized-feed.json`

No unauthenticated FUTBIN scraping or assumed FUTBIN API is implemented.


## Current pipeline outputs (not live)
Every successful run creates three review files:
- `pending.json`: raw validated provider feed
- `sbc-candidates.json`: complete challenges mapped to the existing `SbcChallenge` app type
- `card-candidates.json`: complete player stats with art origin and license-review status

A source that omits `app` mappings for SBCs, or full six-stat values plus an HTTPS artwork source for cards, fails closed. No partial payload is silently published.

### Complete card candidate
```json
{
  "id": "unique-promo-card-id",
  "baseId": "existing-player-id",
  "name": "Player",
  "program": "Ultimate Scream",
  "rating": 88,
  "position": "ST",
  "nation": "England",
  "league": "Premier League",
  "club": "Example FC",
  "artSourceUrl": "https://licensed-provider.example/card.png",
  "face": { "pac": 88, "sho": 89, "pas": 78, "dri": 85, "def": 40, "phy": 81 }
}
```

### Complete SBC app mapping
Each feed SBC still has unique `id`, `name`, nonempty `requirements` array, and `rewardCardId`, plus:
```json
{
  "app": {
    "title": "Challenge",
    "kind": "classic",
    "requirements": "Full text of verified requirements",
    "reward": "Verified reward",
    "createdAt": "2026-10-31T18:00:00Z",
    "endsAt": "2026-11-05T18:00:00Z",
    "targetScore": null,
    "rules": { "chemistry": 20, "minRating": 83 },
    "previewFormation": null,
    "previewSquad": null
  }
}
```
Classic rules must map exactly to supported app rule keys. Structured constraints requiring richer types are rejected until a safe adapter exists. Streamlined entries instead require `rules:null` and a positive integer `targetScore`.

**Not implemented yet:** live source connection, automatic licensed artwork acquisition, reliable solution generation, SBC player reward previews, release packaging, and production publishing. The scheduled Action runs only from the default GitHub branch after merge and needs secrets before it can fetch anything. Android builds use bundled data and do not automatically refresh from GitHub changes.
