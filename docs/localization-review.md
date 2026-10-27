# Arabic, Brazilian Portuguese and Spanish rollout

Status: incomplete draft; new languages remain disabled. Do not deploy as a complete localization.

## Terminology references consulted

- Arabic EA glossary: https://help.ea.com/ar/articles/ea-sports-fc/glossary/
- Spanish EA glossary: https://help.ea.com/es/articles/ea-sports-fc/glossary/
- Brazilian Portuguese EA glossary: https://help.ea.com/pt-br/articles/ea-sports-fc/glossary/
- Brazilian Portuguese tokens: https://help.ea.com/pt-br/articles/ea-sports-fc/tokens/
- Brazilian Portuguese PlayStyles and chemistry: https://help.ea.com/pt-br/articles/ea-sports-fc/playstyles-guide/
- Arabic chemistry and SBC context: https://help.ea.com/ar/articles/ea-sports-fc/ultimate-team-evolutions/

These sources support game terminology, not the accuracy of every interface sentence or a legal review. The translated UI sentences and policy excerpts are drafts authored for this project. They have not all received independent linguistic review.

## FC 27 PlayStyle names

EA's FC 27 PlayStyles article was consulted for the 35 names listed in its Arabic, Brazilian Portuguese and Spanish versions: https://www.ea.com/ar/games/ea-sports-fc/fc-27/news/what-are-playstyles, https://www.ea.com/pt-br/games/ea-sports-fc/fc-27/news/what-are-playstyles and https://www.ea.com/es/games/ea-sports-fc/fc-27/news/what-are-playstyles. Power Shot was not in those lists; the Arabic, Brazilian Portuguese and Spanish names are supported by the localized EA Help PlayStyles guides (including https://help.ea.com/es/articles/ea-sports-fc/playstyles-guide/). Additional legacy scouting names and Rush Out remain descriptive drafts requiring review. Check terminology in the actual game before release.

## Checks and remaining work

`node scripts/verify-new-locale-drafts.mjs` checks matching keys, nonempty values and absence of Hebrew in the draft dictionaries. It does not establish linguistic correctness.

`node scripts/check-new-locale-coverage.mjs --require-complete` reports missing literal interface copy and missing entries from the existing legal dictionary, and fails while either is incomplete. Dynamic expressions are reported separately. This is not a full end-to-end translation test.

Still required before enabling: finish all dictionaries, review dynamic messages, legal text and the primary legal notice, translate data-driven Career/SBC/mini-game text and football identities, migrate display helpers from the legacy two-language interface, apply Arabic RTL consistently, remove two-language toggles from navigation and registration, and test first selection, persistence, settings and every screen in all five languages.

Keep the production catalogue at 20,198 cards. Use the current production revision as the release base and reconcile any later production changes before deploying.
