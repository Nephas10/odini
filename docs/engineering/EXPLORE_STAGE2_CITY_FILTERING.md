# ODINI Stage 2: city-based Where filtering

Date: 13 October 2026 (Africa/Lusaka). Branch: `feature/explore-city-filtering`.

**Outcome:** 41 tests pass, standalone TypeScript and production build pass. ESLint remains at the Stage 1 baseline of six errors/fifteen warnings, with no new findings. Stage 2 is complete and uncommitted for review.

## Stage 1 checkpoint and Git safety

The user explicitly approved the local checkpoint. Commit **`f038f5b21ff9ac47118502968c87b5b43a766350`** on `test/explore-regression-baseline` has message `test(explore): establish regression testing baseline`.

Only the eight approved Stage 1 files were staged: `app/user/ListingsClient.tsx`, `lib/explore/filterListings.ts`, `tests/explore/filterListings.test.ts`, `package.json`, `tsconfig.json`, and the three reports `EXPLORE_REGRESSION_BASELINE.md`, `EXPLORE_STAGE1_CODE_REVIEW.md`, `EXPLORE_STAGE1_CORRECTIONS.md` under `docs/engineering/`. Staged names/stat/content and whitespace were reviewed; a targeted credential-pattern scan found zero matches, and no generated files were staged. All 24 tests passed immediately before the commit.

Post-checkpoint Git status contained only untracked `docs/engineering/LOCAL_DEVELOPMENT_BASELINE.md` and `docs/odini-assessment/`. Those earlier reports remain untracked. The feature branch was created directly from this checkpoint. Stage 2 changes are not staged or committed. No push, merge or deployment.

## Inspected location contract

**Verified in source, not live schema:** `app/user/action.ts#getListings` reads a single `location` field along with base listing fields. The component's Listing type declares `location: string | null`. Host creation writes a trimmed free-text location (`app/host/listings/new/action.ts`); that file was inspected, not edited. There is no separate city/province/neighbourhood contract in the inspected discovery code.

`app/user/page.tsx` passes those records to ListingsClient. Cards render the existing `listing.location` string. Stage 2 only derives a destination for selection/matching; it does not rewrite records, queries, stored data or card display text. No Supabase connection was made and no actual location corpus was available. Database columns/constraints beyond the source contract remain unknown.

## Files changed for Stage 2

| File | Change |
|---|---|
| `lib/explore/locations.ts` | New pure typed normalization/matching/options utilities and explicit initial destination list |
| `lib/explore/filterListings.ts` | Where predicate now uses destination matching; other predicates unchanged |
| `app/user/ListingsClient.tsx` | Where choices derived through getDestinationOptions; full cards, controls and reset handlers retained |
| `tests/explore/filterListings.test.ts` | 17 new destination cases; one deliberate update to the historical location test |
| `docs/engineering/EXPLORE_STAGE2_CITY_FILTERING.md` | This implementation/verification report |

No Stage 2 edits to package manifests, lockfile, TypeScript configuration, server pages/actions, authentication, booking/payment/host/FYP code or environment/Supabase configuration. No dependencies installed, migrations or database writes.

## City-matching rules

`SUPPORTED_DESTINATIONS` explicitly lists **Lusaka, Livingstone, Kitwe, Ndola, Kafue and South Luangwa**. South Luangwa is a destination rather than a city; it does not create another product category. Choices are drawn from this small initial discovery list, not intended as all Zambian cities.

1. Split a nonblank stored location on commas only.
2. Trim each token, collapse repeated whitespace and lowercase for comparison.
3. Match **whole tokens** against the explicit destination labels; do not perform arbitrary substring/prose matching.
4. Return the canonical label if exactly one distinct supported destination matches.
5. Return null if no supported destination matches or multiple distinct destinations match. Repeating the same destination is not conflicting.
6. Match a selected canonical destination case-insensitively with the same whitespace normalization. The existing literal `all` value bypasses the location predicate completely.

| Input | Derived destination |
|---|---|
| `Lusaka` | Lusaka |
| `Roma, Lusaka` | Lusaka |
| `Kabulonga, Lusaka, Zambia` | Lusaka |
| `Woodlands, Lusaka` | Lusaka |
| `Livingstone, Southern Province` | Livingstone |
| `Kitwe, Copperbelt` | Kitwe |
| `  rOmA , lUsAkA , Zambia ` | Lusaka |
| `Roma`, `Remote Camp`, null, blank | Unknown; no assignment |
| `Lusaka, Kitwe` | Ambiguous; no assignment |
| `Newlusaka`, `Lusaka Heights`, `Near Lusaka` | No whole destination token; no assignment |

The confidence rule is an **explicit supported token**, not inference from a neighbourhood or province. Noncity tokens are treated as descriptive context; they are not geocoded or verified against province/country geography. No standalone neighbourhood aliases, spelling corrections or city guesses were introduced. This deliberately conservative approach supports all requested examples without a database change.

## Where options and behaviour compared with Stage 1

Choices are sorted, canonical and deduplicated from the complete listings prop, before category/search/budget filtering. Unsupported or conflicting destinations are omitted from this dropdown. If no records map confidently, All locations remains available and still returns all otherwise eligible listings.

Stage 1 required an exact case-sensitive full-location match and listed full location strings as choices. Stage 2 groups explicit address/city strings under canonical destinations and tolerates capitalization/whitespace. Full listing locations stay unchanged for card display and text search. Exact city values continue to work. Search, category, inclusive min/max bounds, zero/null-price handling, AND combination, ordering/identity and reset handlers are unchanged.

Unknown/ambiguous locations are **not hidden from All locations**. They remain subject to other filters and searchable through their full original text. Selecting a city excludes them because there is no confident assignment. No neighbourhood drill-down, URL state, When, Vibe, Best Fit, presets or redesign was added.

## Tests preserved, added and updated

All 24 Stage 1 test cases remain. The single location test was deliberately renamed and updated to accept `lusaka` and ` Lusaka ` rather than rejecting them. It continues to reject the partial `Lusa` token. A comment identifies this approved change; original assertions remain available in checkpoint `f038f5b21ff9ac47118502968c87b5b43a766350`. No failing test was silently removed.

The **17 new cases** cover:

- Six exact supported destinations (one test each).
- Neighbourhood+city and no standalone neighbourhood guessing.
- City+province/country examples.
- Capitalization and outer/repeated token whitespace.
- Missing/blank/unknown locations.
- Multiple distinct destinations, unrecognized slash format and repeated same destination.
- Embedded city names and prose false matches.
- Derived/deduplicated/sorted options, empty and entirely unmapped input.
- Lusaka grouping across synthetic Stay/Event/Activity records.
- Combined city/category/search/budget predicates and full-address search.
- All locations restoration retaining unknown/ambiguous/null data while other filters stay active.
- Frozen full-location data, record order and object identity remaining unchanged.

The existing independent combined-filter cases remain, including single-failure category/search/location/minimum/maximum candidates. Tests use synthetic records only; no application page, Supabase client or live record is loaded. Full display data is verified through record fields/identity and unchanged JSX inspection, not a browser-render assertion. State-reset coverage remains a function-input test rather than button-click automation.

## Verification

Final results after import/whitespace cleanup:

| Command/check | Result | Comparison with Stage 1 |
|---|---|---|
| `npm run test:explore` | Exit 0; **41 passed**, 0 failed/skipped/cancelled | All 24 cases retained; one approved location expectation update and 17 new cases |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0; no diagnostics | Still passes |
| `npm run lint -- --format json --output-file TEMP/odini-stage2-eslint.json` | Exit 1; **6 errors, 15 warnings** | Identical file/rule/severity/message findings to Stage 1; existing component line positions shifted |
| `npm run build` | Exit 0; optimized compilation, TypeScript, page data and static generation completed | Still passes; route output unchanged |
| `git diff --check` | No whitespace errors | Clean |

The new utility, filtering helper and test file have zero lint errors/warnings. No unrelated baseline fixes were made. Existing native module-detection and ignored parent-lockfile warnings remain; no new warning was observed. Builds ran with the existing authorized worker process access and command-local telemetry disabled. No Supabase variables were supplied. Build success does not verify live dynamic data access.

Final build timings: compilation 34.1 seconds, build TypeScript 73 seconds and static generation 23.6 seconds. These are local command observations rather than performance benchmarks. An initial check passed before import placement/EOF whitespace cleanup; final commands above verified the cleaned source. No packages or configuration changed to achieve these results.

Final Git state: three modified tracked Stage 2 files (`app/user/ListingsClient.tsx`, `lib/explore/filterListings.ts`, `tests/explore/filterListings.test.ts`); untracked `lib/explore/locations.ts` and this report, alongside the preserved earlier baseline/assessment documents. The index is empty. HEAD remains `f038f5b21ff9ac47118502968c87b5b43a766350`; the Stage 2 branch contains no additional commit.

## Remaining limitations and approval decisions

- Actual Supabase location formats, policies and runtime data visibility were not inspected. The current rule cannot resolve omitted cities, misspellings, foreign/contradictory geographic descriptions or non-comma prose as a geocoder would.
- Provinces/country names provide context only; a supported whole city token is authoritative for this limited normalization. Conflicting supported destination tokens are rejected. Kafue plus bare Lusaka therefore remains ambiguous; `Kafue, Lusaka Province` has only one supported whole token.
- Unsupported cities/destinations remain in All locations and text search but are absent from city choices. Expanding the explicit mapping, adding neighbourhood-only aliases, new delimiters, spelling corrections or stricter geographic validation requires a separate reviewed product/data decision.
- Supported list intentionally covers the initial six destinations rather than every Zambian municipality. No broader national taxonomy or schema migration is proposed.
- Native TypeScript's existing module-detection warning and lack of toolchain pin remain. No extra test/browser dependency was added.
- No configured browser walkthrough, keyboard/mobile validation, live database or actual reset-click test. Existing unrelated lint findings remain baseline debt.

No further approval was required for the supplied unambiguous examples and conservative unmapped fallback. Expansion or guessing beyond these rules should be explicitly reviewed. Implementation stops for review; Stage 2 is not committed automatically.
