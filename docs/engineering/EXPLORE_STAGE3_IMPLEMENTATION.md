# ODINI Stage 3: event-date filtering implementation

Date: 13 October 2026 (Africa/Lusaka).
Branch: `feature/explore-event-date-filtering`.
Base and unchanged HEAD: `af15499ec4daff45233bd557f3531ddbe64b27ba`.

**Outcome: ready for independent code review.** 115 regression tests pass: the unchanged 67-test baseline plus 48 focused additions. TypeScript and production build pass. ESLint remains at six errors and fifteen warnings with identical findings to the Stage 2 baseline. Implementation is uncommitted and unpublished.

## Authorization and preflight

The user explicitly authorized Stage 3 implementation and confirmed Nephas's approval of the discovery-only change to `app/user/action.ts#getListings`. Before editing, branch/HEAD matched the checkpoint, tracked working tree and index were clean, and all 67 baseline tests passed. Existing untracked engineering audits, local-development baseline and `docs/odini-assessment/` were preserved.

Read the Stage 3 feasibility audit and the verified prototype's `src/components/filters/DiscoveryBar.tsx` and `src/pages/Explore.tsx` from the supplied ZIP's existing temporary extraction. The prior approved handoff/checklist and latest implementation instructions define the narrower implementation scope. Read installed Next.js server/client documentation before coding, and its `unstable_rethrow` documentation before finalizing local exception handling.

## Figma traceability and scope

The prototype has a When control and a native specific-date input. This increment implements that specific-date input with a visible When label, controlled value, standalone Clear date button and existing full-reset handlers. It uses the current Explore styling and keeps existing search, Where, price, category and card layout intact. Accessible label/help text explains that dates affect Events in Zambia time.

Today/Tomorrow/This Weekend shortcuts, date ranges, URL state, Vibe, Best Fit, budget presets and a Figma redesign are not part of the approved single-date plan. Prototype mock availability filtering for Stays/Activities is superseded by the explicitly approved Events-only product rules. No new navigation was introduced.

## Files changed and impact

| File | Necessary change | Existing consumers | Risk and authorization |
|---|---|---|---|
| `app/user/action.ts` | Add only `events(event_time,end_time)` to getListings projection | Only `app/user/page.tsx` calls getListings in current source | Nephas and user approval obtained; live relationship/RLS behaviour remains unverified |
| `app/user/page.tsx` | Normalize discovery schedule; separate retrieval failures from successful empty results | Explore route | Local-only change approved; preserve Next framework control flow |
| `app/user/ListingsClient.tsx` | Optional schedule type, controlled date, clear/reset wiring and helper text | Explore page | Approved UI addition; browser interaction verification pending |
| `lib/explore/filterListings.ts` | Optional date/schedule fields and one additional Events-only AND predicate | Explore component and synthetic tests | Existing predicates remain unchanged; optional date preserves old callers |
| `lib/explore/eventDates.ts` | New pure to-one normalization, calendar validation and interval matching | Explore page, filter helper and tests | No React/Next/Supabase imports or new dependencies |
| `tests/explore/filterListings.test.ts` | Append 48 tests and utility import | Existing test:explore command | All original tests retained without expectation changes |
| `docs/engineering/EXPLORE_STAGE3_IMPLEMENTATION.md` | This report | Engineering reviewers | New approved Stage 3 documentation |

The smallest query extension uses the existing embedding instead of another query/client, N+1 lookups or a schema change. Search/category/city/budget remain in the existing pure client filter pipeline. Day bounds are computed once per filter invocation rather than once per record. No capacity or ticket logic is read by the date utility.

## Discovery data contract

The sole shared-module change is this projection addition after `created_at`:

```text
events (
  event_time,
  end_time
)
```

All original selected fields, `is_active = true`, descending created_at order, success/error return structure and existing query-error logging are unchanged. No `!inner` join was added. This is intended to retain parent listings without an event relation; actual live embedding has not been tested.

The supplied events.listing_id PK/FK indicates a to-one relation. The pure adapter accepts object/null data and copies the two original schedule values into `eventSchedule`. Null/missing relations become null. Unexpected arrays, including singleton arrays, are conservatively unresolved rather than silently selecting element zero. Unexpected field values are rejected during active-date matching. An omitted end is treated as an absent end; explicitly malformed ends are rejected.

The page adds the derived schedule to new records using object spread; it does not rewrite the original location, timestamps or other listing fields. Pure filtering returns original matching input objects in original order. No base fields or historical card location text are modified.

Exact source-text comparison against the checkpoint confirms **getListingById and logoutAction are unchanged**. Event-detail and booking consumers are therefore untouched. The detail page's pre-existing array relationship assumption remains outside this scope.

## Date rules

1. Empty/omitted date bypasses the date predicate, including for undated or malformed Events.
2. Strict YYYY-MM-DD validation rejects impossible dates and rollover dates. Year zero, whitespace-padded selections and malformed date values are rejected. Invalid active dates exclude Events while preserving otherwise eligible non-Events.
3. Native Intl with explicit `Africa/Lusaka` derives half-open local-day instant bounds. Date parsing/calendar arithmetic uses UTC explicitly, independent of the browser/process timezone. Example: 2026-10-13 spans `[2026-10-12T22:00:00Z, 2026-10-13T22:00:00Z)`.
4. Only literal `listing_type === "event"` is date-filtered. Stays and Activities still obey their existing category/search/city/budget predicates.
5. Starts must be valid timezone-bearing ISO timestamps with valid calendar/time/offset components. The parser accepts Z or colon-separated offsets, fractional seconds up to PostgreSQL's six digits and a T or space separator. Missing, nonstring, timezone-free or malformed starts abstain.
6. Null/omitted ends and equal start/end instants match the start's local day only.
7. A valid later end represents `[start,end)`. It matches when `start < dayEnd && end > dayStart`. Ending exactly at selected-day midnight does not match that day; ending at the next midnight still matches the selected day.
8. Explicitly invalid ends and ends before starts do not match an active date.
9. Timestamp comparisons use seconds with preserved submillisecond fractions so microsecond boundaries in modern event timestamps are not silently truncated to midnight.
10. Capacity, available slots, bookings and payments never participate. A date match does not imply ticket availability.

No old filter was rewritten: case-insensitive trimmed full-text search, conservative city matching, inclusive min/max bounds, zero/null-price behaviour, existing Number conversion, AND semantics and listing order remain intact. Date clearing preserves every other active field. Both existing full-reset controls now also clear date.

## Local error handling

Successful empty discovery still renders the existing empty-results UI. An unsuccessful getListings result instead renders a local `role="alert"` with “Unable to load listings” and refresh guidance; raw backend details are not exposed. Thrown ordinary discovery failures also take this local path and emit only a generic server log message.

The page calls Next.js's documented `unstable_rethrow` first in its catch handler. This preserves framework exceptions for request-time APIs, redirects and other internal control flow instead of treating them as catalog failures. A build initially exposed this distinction through a generic error log during prerendering; the final build after the correction passes without that log and retains the dynamic /user route. No auth or shared error infrastructure was altered. The existing Next API is marked unstable; compatibility should be checked during future Next upgrades.

## Tests and evidence

**115 passed; zero failed, skipped or cancelled.** Tests use synthetic Stay/Event/Activity records and import pure utilities only. No database, React renderer or browser package is used.

48 additions cover explicit UTC/Lusaka bounds; leap-day/year boundaries; ten invalid selected-day cases; 26 start/end scenarios including midnight, offsets, overnight/multi-day overlap, exclusive ends, microseconds, equal/null ends, malformed/calendar-rollover values and reversed intervals; relation adapter shapes; mixed-category ordering/identity; individual category semantics; combined date/category/text/city/budget filtering; invalid-date behaviour; date clearing/full-state restoration; and malformed schedules with no date plus zero/null prices. A matching fixture has zero slots/capacity and remains included.

Source comparison confirms the entire original test file remains an unchanged prefix after accounting for the one new import. No original case, assertion or expected result was removed, skipped or weakened. Existing independent single-constraint fixtures still exercise old category/search/location/min/max semantics.

Reset tests verify restoration of function-input state, not UI button clicks. Source inspection confirms controlled input/setDate, Clear date, hasAnyFilter and both clearFilters button connections. Schedule identity/full-address assertions establish data preservation, not rendered browser output. The local error branch and framework rethrow are source/static/build verified, not covered by a mounted page or mocked Supabase integration test.

## Final verification

| Command/check | Result |
|---|---|
| `npm run test:explore` | Exit 0; 115 passed |
| Same native test command with command-local `TZ=Pacific/Honolulu` | Exit 0; 115 passed; timezone invariance confirmed for synthetic suite |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0; no diagnostics |
| `npm run lint -- --format json --output-file TEMP/odini-stage3-eslint.json` | Exit 1; six errors/fifteen warnings, unchanged from Stage 2 readiness JSON by file/rule/severity/message |
| `npm run build` | Exit 0; compilation, TypeScript, page collection/static generation completed; existing routes retained |
| `git diff --check` | No whitespace errors |
| New utility no-index whitespace check against NUL | No whitespace diagnostics; exit 1 denotes a new/different file |
| Protected paths and shared-export comparison | No protected-path changes; detail/logout source text identical |
| Targeted credential-pattern scan of actual diff/new utility | Zero matches; complements manual review, not a universal secret-detector guarantee |

Final build compilation took 9.9 seconds, build TypeScript 12.9 seconds and static generation approximately 1.4 seconds. These are local observations rather than performance benchmarks. Build used approved compiler-worker process access with command-local telemetry disabled and no supplied Supabase variables. Only ignored build artifacts were regenerated; none is included in the source change set.

Existing native TypeScript module-detection and Next parent-lockfile warnings remain. No new lint finding, package installation, manifest/lockfile/tsconfig change or unrelated lint fix occurred. Git LF/CRLF advisories are not whitespace failures.

## Unverified integration assumptions and remaining risks

- No live Supabase request, credentials, RLS/grant inspection, migration, security modification or production access was performed. The join uses supplied schema context, not verified runtime responses. Successful build/tests do not establish database integration.
- Nephas must verify discovery embedding, object/null cardinality, schema-cache relationship detection and events SELECT permissions in an authorized environment. If actual data comes back as arrays or inaccessible schedules, active date filtering conservatively excludes those Events. Do not change RLS/auth to work around it.
- Host-written timestamp quality and original timezone interpretation are unverified. This code compares provided instants; it does not correct host data or infer missing dates/end times.
- Browser date selection/clearing/reset, native picker presentation, mobile layout, keyboard/accessibility and displayed retrieval failures need a configured runtime walkthrough. Unit tests cannot certify these interactions.
- Client filtering examines only the fetched catalog. Existing unpaginated-query size/Data API limits and production performance remain unknown; server pagination/filtering is a separately scoped concern.
- Strict timestamp/date validation and conservative malformed-relation handling intentionally abstain instead of guessing. Valid non-ISO representations, infinity and unexpected response shapes are not treated as valid schedules.
- The conservative Stage 2 location coverage, existing lint debt, native-test isolation warning/toolchain pinning limitations and unrelated search/navigation findings remain unchanged.

## Review and rollback checkpoint

No protected Host/auth/booking/payment/FYP/Supabase/client/config files changed. Only the approved discovery projection in the shared action module changed. No commit, push, merge, rebase or deployment occurred. The Stage 1+2 remote review branch is unaffected.

Rollback is confined to the reviewed Stage 3 changes in the five modified files and new eventDates utility; reverting the projection and associated Explore code together restores the Stage 2 contract. No database rollback is needed. Do not use destructive Git commands against unrelated untracked documents. Obtain separate checkpoint approval after independent review.

**Stop for review.** No outstanding product-policy approval is needed within the implemented single-date scope; live integration and browser verification remain pending, and no further feature work is authorized by this report.
