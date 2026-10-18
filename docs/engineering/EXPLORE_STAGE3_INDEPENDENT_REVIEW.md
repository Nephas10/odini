# ODINI Stage 3 independent code review

Date: 13 October 2026 (Africa/Lusaka).
Branch: `feature/explore-event-date-filtering`.
Reviewed HEAD/reference: `af15499ec4daff45233bd557f3531ddbe64b27ba`.

## Verdict: APPROVE WITH CONDITIONS

The actual implementation preserves the Stage 2 filter predicates and protected modules, confines the shared query change to the approved projection, and satisfies the approved date rules for the independently tested modern schedules. All 115 tests pass; TypeScript/build pass; ESLint findings match the established baseline exactly. No Critical, High or Medium implementation defect was found within that tested scope.

A **verified Low precision defect** exists for distant but accepted dates: floating-point seconds can round a microsecond before midnight into the selected day. Address or explicitly accept that limitation before merge; do not describe microsecond handling as exact across all accepted years. Browser and authorized Supabase embedding verification remain release conditions. This verdict does not authorize committing, publishing or merging.

## Reviewed scope and Git evidence

Branch and HEAD match the requested baseline. Index is empty. The five tracked changes against the checkpoint are:

- `app/user/action.ts`
- `app/user/page.tsx`
- `app/user/ListingsClient.tsx`
- `lib/explore/filterListings.ts`
- `tests/explore/filterListings.test.ts`

The new untracked implementation file `lib/explore/eventDates.ts` was read in full with numbered lines and reviewed through `git diff --no-index` against NUL; it is not included by ordinary git diff. The untracked `docs/engineering/EXPLORE_STAGE3_IMPLEMENTATION.md` was assessed as documentation and scanned with the actual diff/new utility. This review creates only `docs/engineering/EXPLORE_STAGE3_INDEPENDENT_REVIEW.md`.

Pre-existing untracked search/date audits, LOCAL_DEVELOPMENT_BASELINE.md and docs/odini-assessment remain preserved. No unrelated file was staged or included. Read-only Git status/diff/stat/check and source comparisons were used; no remote operations or history changes occurred.

The complete tracked filename diff contains only the five authorized files. Protected-path checks show no Host Dashboard, authentication, proxy, Supabase client/configuration, booking/payment, event-detail or FYP changes. Manifests, lockfile, tsconfig and Stage 2 location utility are unchanged. No generated artifacts appear in the reviewed source scope. A targeted credential-pattern scan returned zero matches; manual source review found no credentials. This is not a universal secret-scanning guarantee.

## Findings by severity

### Critical

None found.

### High

None found.

### Medium

None found in the inspected implementation. Unverified live relationship/security behaviour is an integration condition, not a demonstrated source defect.

### Low L1 — microsecond comparisons lose precision for distant accepted dates

**References:** `lib/explore/eventDates.ts:47–52,60–70`; accepted calendar format at `:16–20`. Current modern microsecond tests are in `tests/explore/filterListings.test.ts:345–346` and adjacent boundary cases within `:335–366`.

The parser reconstructs fractional seconds correctly, but stores epoch seconds as a JavaScript number. For sufficiently distant instants, representable increments exceed one microsecond. An independent execution of the actual utility produced:

```text
selected day: 2256-10-13
event_time:   2256-10-12T21:59:59.999999Z
end_time:     null
expected:    false (one microsecond before Lusaka midnight)
actual:      true
```

The equivalent 2026 probe correctly returned false. The utility accepts 2256 as a valid calendar year, so this is a real boundary defect rather than invalid input. It is Low because no effect on current rollout schedules was demonstrated; the modern midnight/microsecond probes passed. This does not invalidate the 115 passing tests, but exposes their limited precision horizon.

**Recommended correction:** compare exact integer microseconds, or an integer-seconds/fraction representation that retains ordering. Add an explicit negative boundary regression for the reproduction. A bounded supported date range is another product option only after explicit approval; do not silently add UI/date restrictions. Before merge, correct this or obtain explicit acceptance of the limitation and document the supported precision horizon.

### Low L2 — page/error/reset interactions lack automated integration coverage

**References:** `app/user/page.tsx:8–13,36–46`; `app/user/ListingsClient.tsx:70–76,123–135,184,230`; `tests/explore/filterListings.test.ts:421–426`.

Reset coverage restores a manually constructed filter-state object. It cannot detect removal of setDate from the UI reset handler. No test mounts the page to distinguish success-empty, query-error and thrown-error rendering. These are openly documented gaps, not weakened tests or source-confirmed failures. Current source wiring is correct.

**Recommended verification:** browser walkthrough for date selection, standalone clearing, both resets and mixed filters; controlled response fixtures for success-empty/failed retrieval in a future approved integration setup. No new testing dependency is required or authorized by this review.

### Low L3 — framework exception compatibility depends on an unstable Next API

**References:** `app/user/page.tsx:4,8–9`; installed `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/unstable_rethrow.md`.

Use is appropriate for the current installed Next version: the rethrow call is first in the promise catch, and ordinary errors then take the local path. The API is explicitly marked unstable. This is an upgrade-maintenance risk, not a current failure.

**Recommended action:** keep framework-signal checks when upgrading Next. Do not replace this with a broad swallowing catch or ad hoc error-message checks.

## Architecture and shared-module safety

The pure utility has no React, Next, Supabase or external-service imports. UI owns selected-date state; the server page owns response adaptation/error presentation; the query owns retrieval; filtering composes the date predicate with existing predicates. This is a small implementation consistent with separation of concerns, KISS/DRY/YAGNI and existing architecture; no speculative abstraction or dependency was introduced.

`EventSchedule` deliberately uses unknown fields at the raw boundary, with runtime validation before matching. Optional date/schedule properties preserve existing typed callers and old fixtures. Original base listing fields remain assumed valid under the existing contract; Stage 3 does not introduce a general listing-schema validator. The adapter returns a new small object and never edits its input. Array.filter preserves matching object identity and order.

`app/user/action.ts:28–32` adds only events(event_time,end_time) after created_at. Existing base fields, active-publication condition, descending ordering and query-error handling remain unchanged (`:34–48`). No stock fields or inner join were added. Exact source comparison with Git's checkpoint confirms getListingById and logoutAction are unchanged, including their complete bodies. Caller search identifies only the Explore page as a getListings consumer.

## Date semantics independently verified

| Behaviour | Source and executed evidence |
|---|---|
| Africa/Lusaka boundaries | Explicit Intl zone at eventDates.ts:11–14; actual 2026-10-13 bounds are 2026-10-12T22:00Z to 2026-10-13T22:00Z |
| Selected-day validation | Format plus UTC round-trip rejects rollover/invalid dates and year zero at :16–20; ten negative test cases pass |
| UTC offsets | Timestamp must carry Z or a numeric colon-separated offset; positive/negative offsets and local-midnight tests pass at tests:335–366 |
| Midnight and leap days | Start inclusive/next-midnight exclusive; valid 2024 leap day and invalid 2026 leap-day timestamp tested; independent bound probes match |
| Multi-day overlap | Later ends use start < dayEnd AND end > dayStart at eventDates.ts:70; overnight/multi-day and exact exclusive ends pass |
| Null/equal end | Start-day point semantics at :64–69; absent end is also treated as no end and independently probed |
| Invalid schedules | Missing/invalid start, invalid explicit end, end before start fail at :62–68; rollover/timezone-free/nonstring inputs covered |
| Microseconds | Modern last-microsecond/first-microsecond boundary cases pass; distant-date defect L1 independently reproduced |
| Events only | filterListings.ts:49–50 bypasses date for every non-Event; All/Stays/Activities/Events cases pass |
| Existing combinations/order | Old category/location/search/price code unchanged at filterListings.ts:33–47; extra date term uses AND at :52; identity/order/combined tests pass |
| Clearing/reset | Empty date bypasses schedule matching; Clear date changes only date; both existing full resets call the shared handler now including setDate("") |

Additional independent probes exercised accepted extreme calendar years, missing-end objects, a reversed one-microsecond interval, and a one-microsecond end after day start. Normalized dates/timestamps do not replace original full addresses or schedule data. No availability/capacity check exists; a synthetic sold-out Event remains date eligible.

## Supabase contract and unresolved integration

The supplied events.listing_id PK/FK supports an expected to-one object/null relationship. The projection uses the existing relation with default embedding and no !inner; no query publication/order rule changes. This is consistent with the supplied schema and avoids intentionally dropping non-Event parent records. Actual PostgREST cardinality, schema cache, grants and RLS remain unverified.

`normalizeEventSchedule` at eventDates.ts:4–7 abstains on null/missing/nonobject/array values. Object fields retain raw values for later validation. A singleton array is deliberately rejected, not silently coerced; if runtime relation shape differs, those Events remain visible without a date but fail active date matching. This is safe abstention, with a material rollout dependency on real response verification.

No Supabase connection, production credentials, schema/RLS/security inspection or change was performed. A successful build is not proof that public event schedules can be retrieved. Nephas must verify the joined response and relevant SELECT visibility in an authorized environment; do not change security/authentication to unblock this.

## Next.js error handling

Failed getListings results and thrown ordinary retrieval errors render the local alert. Success with an empty array reaches the original empty-result component instead. Raw backend error details are not rendered; existing query-error logging remains untouched. The generic thrown-error log provides less diagnostic detail, but no additional logging change is required for this scope.

The installed Next documentation supports calling unstable_rethrow first in a promise catch for framework-controlled exceptions, including request-time APIs. Direct in-memory probes using installed next/navigation confirmed redirect and notFound exceptions were rethrown as the same objects, and an ordinary Error was allowed to continue to local handling. The fresh production build retained a dynamic /user route without the previously discussed swallowed-control-flow log. This verifies the helper behaviour/build path, not every page request or auth transition in a browser.

## Figma and UI assessment

The verified prototype's DiscoveryBar.tsx:131–137 contains a controlled native specific-date input with an accessible label. The implemented ListingsClient.tsx:123–135 retains that interaction within the approved existing Explore layout, adds a visible associated label/help text and an explicit clearing action. Controlled value/onChange, date-only clearing, hasAnyFilter and both full-reset connections are correct in source.

The prototype also contains Today/Tomorrow/This Weekend choices. Their omission follows the approved narrower single-date plan; this is not full prototype replication. The prototype's mock Stays/Activities availability logic is superseded by approved Events-only rules. No new Figma requirement, redesigned navigation, Vibe, Best Fit or budget feature was inferred.

The flex-wrap container and full-width/sm-width input are reasonable responsive choices. Native picker appearance, wrapping at narrow widths, touch/keyboard/screen-reader behaviour and both reset clicks were not browser-tested. No accessibility or layout regression was demonstrated from source, but browser fidelity is still a required check.

## Test quality and fresh verification

115 tests genuinely exercise the real pure implementations: literal expected booleans/IDs, synthetic records, frozen fixture records and identity/order checks. Baseline source comparison shows the entire original file unchanged apart from the added import followed by appended cases. All 67 prior tests are retained; no expectations were weakened and no test was skipped/deleted.

The 48 additions are useful boundary/negative/composition coverage, not a claim of exhaustive dates or integration. Some calendar/point cases overlap for readability. The distant-date precision failure is absent from the suite. Missing-end object handling, space-separated timestamps and subsecond reversed/equal intervals would benefit from explicit regression cases. Existing independent min/max/category/search/location tests remain, while Stage 3's combined fixture directly exercises date, city, search and maximum-price failures. UI/page/database gaps are described above; no test is coupled to Supabase internals.

| Fresh independent command/check | Result |
|---|---|
| npm run test:explore | Exit 0; 115 passed, zero failed/skipped/cancelled |
| node node_modules/typescript/bin/tsc --noEmit --incremental false | Exit 0; no diagnostics |
| npm run build | Exit 0; compilation 7.5s, build TypeScript 7.1s, static generation approximately 1.6s; route set retained |
| npm run lint with JSON output to TEMP/odini-stage3-independent-eslint.json | Exit 1; six errors/fifteen warnings; zero differences by file/rule/severity/message against Stage 2 readiness JSON |
| git diff --check | No whitespace errors |
| New utility no-index inspection | Full 71-line source reviewed; exit 1 is expected for differing files, not a command failure |
| Source/export/credential/protected-path checks | Original tests and protected exports unchanged; no protected-path diff; zero targeted credential matches |

Existing Node module-detection and Next parent-lockfile warnings persist. No new dependency or lint fix was made. Builds used compiler-worker process permission with command-local telemetry disabled and no supplied Supabase variables. Only ignored build outputs were regenerated. Timing is observational, not a performance guarantee.

## Conditions and required next actions

1. Resolve L1 with exact comparisons and a regression, or explicitly accept/document the limited precision horizon before merge. Date-range restrictions need product approval rather than an unreviewed code change.
2. Verify object/null embedding and event-time visibility with Nephas in an authorized environment before rollout. No security/database change is proposed.
3. Complete browser checks for When selection/clear, both resets, mixed-category filters, mobile/accessibility and success-empty/query-error states.
4. Keep the unstable Next exception API under upgrade review and retain the baseline lint debt as separate work.

A reviewed local checkpoint can be considered after the Low precision finding is explicitly accepted or corrected and separately authorized; it would not establish release readiness. No blocking present-day source defect, shared-export change or protected-module regression was found. No application/test change was made during this review. Stop for the user's decision; no commit, push, merge, rebase, deployment or new feature work occurred.
