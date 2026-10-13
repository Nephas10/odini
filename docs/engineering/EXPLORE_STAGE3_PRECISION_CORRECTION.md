# ODINI Stage 3 precision correction

Date: 13 October 2026 (Africa/Lusaka). Branch: `feature/explore-event-date-filtering`.
HEAD remains `af15499ec4daff45233bd557f3531ddbe64b27ba`.

## Outcome and scope

Review finding L1 is corrected. **159 tests pass**, preserving all 115 prior tests and adding 44 precision regressions. TypeScript and production build pass; ESLint remains at six existing errors/fifteen warnings. No public filter API, date-range restriction, dependency or configuration change was introduced.

Only these files changed during this correction:

- `lib/explore/eventDates.ts`
- `tests/explore/filterListings.test.ts`
- `docs/engineering/EXPLORE_STAGE3_PRECISION_CORRECTION.md` (new)

Earlier Stage 3 application changes remain in the working tree; they are not changes made by this correction. Unrelated untracked documents remain preserved. Nothing was staged, committed, pushed, merged or deployed.

## Root cause and exact correction

The previous parser combined integer milliseconds and fractional microseconds into floating-point epoch seconds. At distant accepted dates, adjacent microseconds can fall between representable numbers and round to the same boundary. This can incorrectly include a start immediately before midnight or lose strict interval ordering.

The timestamp helper now returns `bigint | null`. It uses:

```text
BigInt(parsedIntegerMilliseconds) * BigInt(1000)
  + BigInt(remainingThreeFractionalDigits)
```

Date.parse produces integer milliseconds; within the existing accepted four-digit year range these are safely representable integers. The remaining digits are extracted from the fraction padded to six places. Conversion to BigInt occurs before multiplication or fraction addition, so no fractional ordering is lost. This also handles negative epoch milliseconds: Date.parse locates the containing millisecond, then the nonnegative remainder advances within that millisecond.

Day boundaries remain the existing timezone-derived numeric integer milliseconds. matchesEventDay converts them to BigInt microseconds internally. All start/end/day comparisons are consequently exact integer comparisons; there is no conversion back to Number. BigInt constructor calls avoid BigInt literal syntax under the existing ES2017 TypeScript target. No tsconfig change or polyfill was needed; the installed Node/Next build supports the implementation.

Calendar validation, Africa/Lusaka Intl calculation, timestamp format validation, missing/null/equal end rules, reversed-end rejection and exclusive interval-overlap expressions are otherwise unchanged. No BigInt is exposed in the public day-boundary API, filter state or server-to-client listing payload. The existing normalizer/filter/component remain unchanged.

## Before/after reproduction

Executed the actual utility before and after this correction, without database access:

| Input | Before | After | Expected |
|---|---|---|---|
| Selected day 2256-10-13; start 2256-10-12T21:59:59.999999Z; end null | true | false | false |

The exact reproduction is an independently expected false assertion in the new 2256 boundary table. No older expected result was altered to obtain a pass.

## Regression coverage

42 table cases: 14 explicit scenarios for each of 2026, 2256 and 9999. They cover one microsecond before/at/after midnight; exclusive ends before/at/after midnight; equal endpoints before/at midnight; a reversed one-microsecond interval; positive and negative offsets; and missing ends before/at midnight. Null ends are exercised throughout the table. Literal expected booleans are not derived from the utility.

Two additional cases verify a distant leap day (2400-02-29), including its exclusive next midnight, and negative-epoch fractions in 1969. Existing leap-day, malformed-start/end, multi-day, equal/null-end, Events-only, combined-filter, reset/order/identity and zero/null-price tests are retained.

All 115 pre-correction test source is preserved as an unchanged prefix; this was checked against the in-memory pre-edit snapshot. Total: **159 passed, zero failed/skipped/cancelled**. No original test or assertion was removed, weakened or skipped.

## Verification

| Check | Result |
|---|---|
| npm run test:explore | Exit 0; 159 passed |
| node node_modules/typescript/bin/tsc --noEmit --incremental false | Exit 0; no diagnostics |
| npm run build | Exit 0; compilation 4.9s, build TypeScript 8.8s, static generation approximately 1.5s; route set retained |
| npm run lint with JSON output to TEMP/odini-stage3-precision-eslint.json | Exit 1; six errors/fifteen warnings; zero file/rule/severity/message differences against independent Stage 3 baseline |
| git diff --check | No whitespace errors |
| New utility no-index whitespace check against NUL | No whitespace diagnostics; exit 1 denotes differing/new file |
| Pre/post hashes of action, page, component and filter helper | Identical for all four files |
| Protected-path diff against Stage 2 checkpoint | Empty |

Actual utility/test edits were inspected: the utility replaces only the timestamp representation and internal comparison units, and tests only append precision cases. Existing Node module-detection, Next parent-lockfile and Git LF/CRLF advisories remain. No generated output is included in the source change set. Build ran with approved compiler-worker process access, command-local telemetry disabled and no supplied Supabase credentials.

## Protected modules and remaining integration risks

`app/user/action.ts`, `app/user/page.tsx`, `app/user/ListingsClient.tsx` and `lib/explore/filterListings.ts` are byte-for-byte unchanged from correction preflight. Host Dashboard, authentication, booking, payment, FYP, Supabase/configuration, schemas and security remain untouched. Earlier approved getListings projection changes remain separate Stage 3 work; this correction makes no additional shared-module change.

Browser reset/date selection, native picker/accessibility/mobile behaviour and live Supabase object/null embedding/permissions remain unverified. This numeric correction does not resolve or certify those integrations. Native BigInt must be available in the deployed browser runtime; browser compatibility should be checked during the already pending runtime verification. No new dependency or arbitrary supported-date restriction was added.

This report supersedes the earlier implementation/review reports' floating-point precision limitation and 115-test total; those historical documents were not edited. Review L2/L3 browser/testing and unstable Next API conditions remain unchanged.

Stop for review. No commit, remote publication, merge, deployment or further feature work occurred.
