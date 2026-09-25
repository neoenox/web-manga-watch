# Update source status — 2026-09-03

This file is the current decision record for MVP update sources. Where older design text still describes NDL as the first choice, this decision record takes precedence until the design document is consolidated.

## Global policy

- X API is excluded from the MVP because paid API access is not a project prerequisite.
- Update detection and the user-facing official reading destination are separate concepts.
- Do not infer episode numbers/titles/dates that are missing from the source.
- Public HTML parsers may be retained as fixture-tested PoCs, but **Production periodic access stays disabled unless ongoing automated retrieval and metadata use are clearly permitted**.
- A successful HTTP response with zero/missing/structurally unexpected data is a failure, not "no update".
- Manga body pages and images are never stored or redistributed.

## NDL Search

Decision: **not selected for episode update detection**.

Observed behavior:

- title searches are mainly book/volume records;
- volume/ISBN/author/publication-date metadata can be obtained;
- stable new-episode title or magazine-placement detection was not established;
- magazine searches mix related products and book records;
- repeated requests produced HTTP 429 during investigation;
- commercial use also requires checking NDL/application and upstream-data conditions.

`NdlMagazineAdapter` must therefore remain unimplemented until a deterministic magazine-placement contract is proven.

## Sunday Webry / 『ふたりバス』

Technical status: **PoC works / Production disabled**.

Existing code:

- `src/prototypes/sunday-webry-public-metadata.ts`
- fixture-tested Sunday Webry episode parser
- no manga image/body storage

Current terms check:

- the current Sunday Webry terms identify Shogakukan as the operator and reserve rights in service content;
- the published terms reviewed on 2026-09-03 did not provide an explicit permission for recurring third-party automated metadata retrieval;
- an accessible, authoritative robots.txt decision could not be confirmed in this review.

Therefore lack of an explicit prohibition must **not** be treated as permission. Keep the parser for fixture/manual technical verification only. Do not enable scheduled Production crawling or user notification until Shogakukan permission/terms for this use are confirmed.

Official terms reference:

- https://blog.www.sunday-webry.com/terms_of_service

## Young Magazine official site / 『妹は知っている』

Technical status: **PoC works / Production disabled pending terms**.

The public Young Magazine official homepage currently exposes, for 『妹は知っている』, the series title, author, episode title, publication date, and an official Comic DAYS link. The current PoC:

- GETs only `magazine.yanmaga.jp`;
- matches the series title exactly;
- extracts title/author/episode title/date;
- stores the Comic DAYS URL as a string but does not access Comic DAYS;
- treats zero results, missing required metadata, and an unexpected link host as failure;
- has no HTML fallback to another host.

The official site also states that its site data copyright belongs to Kodansha and prohibits unauthorized reproduction/reposting/broadcasting. No explicit permission for recurring third-party automated metadata collection was confirmed in this review.

Therefore `YanmagaMagazineProbe` remains a fixture/manual-live PoC only. Do not convert it into a scheduled Production adapter or use it for user notifications until Kodansha's applicable terms/permission are confirmed.

Official references:

- https://magazine.yanmaga.jp/
- relevant Young Magazine pages under `magazine.yanmaga.jp`

## Current MVP disposition

| Series | Technical source | Automated correctness | Production use |
| --- | --- | --- | --- |
| ふたりバス | Sunday Webry public metadata PoC | fixture/parser verified | BLOCKED on permission/terms |
| 妹は知っている | Young Magazine official metadata PoC | fixture + live metadata verified | BLOCKED on permission/terms |
| both | NDL Search | insufficient episode-placement precision | not selected |

Until one source clears both correctness and usage conditions, the service must fail closed rather than publish guessed or unverified update notifications.
