# Explore regression baseline

Branch: `test/explore-regression-baseline`. Date: 13 October 2026 (Africa/Lusaka).

## Behaviour recorded before extraction

Source: `app/user/ListingsClient.tsx`, `app/user/page.tsx`, `app/user/action.ts`, `package.json`, `tsconfig.json`.

- Defaults: category/location `all`, search/minimum/maximum empty strings.
- Category matches singular listing_type exactly; `all` disables that predicate.
- Search trims and lowercases input, then matches title, optional description or optional location as a case-insensitive substring. Empty/whitespace-only search matches all.
- Location matches the listing's trimmed full location exactly and case-sensitively. The selected value is not normalized. `all` disables location filtering. Destination options remain derived, trimmed, deduplicated and sorted in the component.
- Empty price inputs become null bounds; other inputs use Number conversion. Minimum and maximum are inclusive hard bounds. Null-price listings remain visible without bounds and are excluded with either bound. Zero is a valid price/bound.
- All predicates combine with AND. An inverted min/max range still filters and yields no matching finite prices; the component separately displays its existing warning. No new numeric validation is introduced.
- Filtering retains input order and record identity; it neither sorts nor mutates the input. Publication filtering/newest order are server responsibilities in getListings, not new helper predicates.
- Both reset buttons retain the existing clearFilters handler resetting all five state fields. No React/reset-button integration test is claimed by the pure test suite.
- Page/query/auth/error handling, cards, layout and navigation remain unchanged. No When, Vibe, Best Fit, presets or redesign is included.

Initial tree: no tracked changes; existing untracked `docs/` preserved. Started from `feature/explore-regression-foundation`; requested branch created without commits. No conflicting changes found.

## Files changed

| File | Change |
|---|---|
| `lib/explore/filterListings.ts` | Pure typed generic filter accepting listing records and the five raw UI filter values; returns matching records in input order |
| `app/user/ListingsClient.tsx` | Imports/calls the helper in place of its inline predicates; state, destinations, price warning, reset handlers and JSX retained |
| `tests/explore/filterListings.test.ts` | 18 tests over six frozen synthetic Stay/Event/Activity records |
| `package.json` | Adds only `test:explore`; dependencies unchanged |
| `tsconfig.json` | Adds `allowImportingTsExtensions: true` so tsc accepts the test's explicit `.ts` import under existing noEmit configuration |
| `docs/engineering/EXPLORE_REGRESSION_BASELINE.md` | This before/after report |

No edits to `app/user/page.tsx`, `app/user/action.ts`, authentication, Supabase clients/configuration, bookings, host management, payment or FYP. No package installation or database connection. The lockfile is unchanged (SHA-256 `942891194039c2fd2b6fe74237dd0ea7045a748cee2b71649f923159e37af562`). Existing documentation and other untracked work were preserved. No commit, push, merge or deployment.

## Testing approach

Node **24.13.0** built-in `node:test` and `node:assert/strict`, using native erasable TypeScript syntax. Before adding the script, a temporary typed helper/test module import passed with this installed Node environment. Existing installed TypeScript 5.9.3 independently checks the helper/tests; native type stripping does not type-check.

Run `npm run test:explore`. Its command is `node --test --test-isolation=none tests/explore/filterListings.test.ts`. In-process execution avoids sandbox child-process spawning restrictions and requires no loader, runner dependency, React renderer, Next server, environment variables or database. The one test file imports only Node built-ins and the pure helper. Isolation from authentication/bookings/host code is through the import boundary, not process isolation. The test command targets this file explicitly and does not discover unrelated tests.

The helper uses existing string category/state types and structurally typed nullable listing fields, retaining the component's full record type through a generic. It intentionally does not add publication filtering, currency conversion, numeric validation, sorting or new defaults. Bounds are converted inside the helper with the same expressions as before; the component keeps its existing conversions for warning/reset visibility.

## Regression cases and results

**18 passed, 0 failed, 0 skipped, 0 cancelled.** Both the direct compatibility/execution check and final npm script passed. The temporary compatibility probe is not counted in the suite's 18 cases.

1. Default/All filters retain every record, including unknown prices.
2. Stay category matches only stays.
3. Event category matches only events.
4. Activity category matches only activities.
5. Case-insensitive title substring search.
6. Case-insensitive description and location search with nullable fields.
7. Surrounding search whitespace and whitespace-only queries.
8. Exact trimmed listing location, case sensitivity, no substring matching and no selected-value trimming.
9. Inclusive minimum boundary and null exclusion.
10. Inclusive maximum boundary and null exclusion.
11. Free zero price, zero maximum, zero range and zero minimum.
12. Unknown prices visible without a bound and excluded by either bound.
13. Category/search/location/both bounds combine with AND.
14. No-match and empty-input results.
15. Original/reversed ordering, record identity and frozen-input nonmutation.
16. Inverted minimum/maximum preserves empty-result behaviour.
17. Existing Number conversion: malformed minimum, negative maximum and numeric whitespace.
18. Restoring all five fields to existing reset defaults restores the original results.

Tests assert expected listing identities, rather than importing prototype mock data or copying the filtering implementation as a test oracle. The fixtures contain only synthetic records in ODINI's three product categories and never enter the production catalog.

## Behaviour-preservation evidence

The component diff replaces its `listings.filter` block with a helper call and adds one import. The helper retains the same category equality, trimmed-location equality, trimmed/lowercase text matching, Number conversion, null-price handling, inclusive comparisons and AND combination. `Array.filter` preserves listing order and objects; frozen-record tests check nonmutation. Existing clearFilters setters and both button bindings remain untouched; resetting the values is covered at the function boundary. This is not a browser test of clicking the reset buttons.

No additional data fetching or server/client boundary change was introduced. The module has no React, Supabase, Next or other runtime dependency. Application cards, routes and price labels are unchanged. No Figma enhancements were implemented.

## Verification against local baseline

| Check | Current result | Previous baseline |
|---|---|---|
| `npm run test:explore` | Exit 0; 18 passed, none failed | No test suite existed |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0, no diagnostics | Passed after Next route-type generation |
| `npm run lint -- --format json --output-file TEMP/odini-stage1-eslint.json` | Exit 1; 6 errors, 15 warnings, matching baseline | 6 errors, 15 warnings |
| `npm run build` | Exit 0; compilation, TypeScript, page data and generation completed | Passed |

Build compilation completed in 26.2 seconds, build TypeScript in 14.5 seconds, static generation in 2.1 seconds. Route output matches the previous baseline; `/user` remains dynamic. Build ran with process access outside the sandbox, as required for Next worker spawning, and telemetry disabled for the command. No runtime Supabase credentials were supplied. The installed Next TypeScript guide was read before extraction as required by `AGENTS.md`.

The helper and test file have no lint errors or warnings. Explore's existing image warning moved from line 247 to line 230 because predicates were extracted. The six unrelated unescaped-entity errors remain in homepage/login/dashboard and the three booking forms; existing image, unused-variable and signup-navigation warnings remain unchanged. No unrelated lint fixes were made.

## New issues and remaining limitations

- Native execution prints `MODULE_TYPELESS_PACKAGE_JSON`, since package.json has no module type and Node detects ESM syntax in `.ts` files. This is a warning, not a failed test. No project-wide `type: module` change or warning suppression was made.
- Tests require the verified Node 24 environment's native TypeScript support and in-process test flag. The project still has no toolchain pin; older Node environments may require a different command or explicit TypeScript compilation in a separately scoped change.
- No DOM/browser/screen-reader coverage, destination-dropdown integration or reset-click test. Reset/default restoration is tested as filter-state input; existing handler/button wiring was reviewed unchanged.
- No Supabase/query/RLS/auth/booking/host integration coverage. Their modules are not loaded. Configured Explore runtime remains blocked by missing Supabase environment variables recorded in `LOCAL_DEVELOPMENT_BASELINE.md`.
- Existing numeric validation quirks and failure-versus-empty-result behaviour are intentionally preserved. Tests characterize these quirks rather than fixing them.
- Node tests execute in one process; future suites must not add global side effects or unrelated application imports without revisiting that choice.

Stage 1 stops here for review. No new Explore functionality is authorized by this testing foundation.
