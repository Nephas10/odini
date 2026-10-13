# ODINI Stage 1 regression test corrections

Date: 13 October 2026 (Africa/Lusaka). Branch: `test/explore-regression-baseline`.

## Outcome and scope

**24 tests passed; 0 failed, skipped or cancelled.** TypeScript and production build pass. ESLint retains the previous six errors and fifteen warnings; findings match the Stage 1 baseline by file, rule, severity and message. No new lint issues.

This correction addresses the combined-filter weakness and weaker expected-value assertions identified in `docs/engineering/EXPLORE_STAGE1_CODE_REVIEW.md`. It clarifies state-restoration coverage without claiming UI reset-button testing.

Only these files were changed in this correction:

- `tests/explore/filterListings.test.ts`: six additional combined-filter tests, dedicated synthetic fixtures, explicit expected IDs, and clearer state-restoration test description.
- `docs/engineering/EXPLORE_STAGE1_CORRECTIONS.md`: this report.

The original 18 tests remain; the state-restoration case was renamed and two assertions strengthened. The existing helper, component, package scripts, TypeScript configuration and lockfile were not edited. Prior uncommitted/untracked work was preserved. No new dependencies, database connection, authentication/booking/host/payment/Supabase changes, commit, push, merge or deployment. Stage 2 was not started.

## Independent combined-filter constraints

Dedicated frozen fixtures are at `tests/explore/filterListings.test.ts:84`. Active filters at line 94: category `event`, search ` MUSIC `, exact location `Lusaka`, inclusive minimum `100`, maximum `200`. The matching candidate is `event-match`, an Event priced at 150 with title Music Session and location Lusaka.

| Active constraint | Candidate rejected only by this constraint | Difference | Expected IDs when only this constraint is relaxed |
|---|---|---|---|
| Category | `stay-fails-category`, `activity-fails-category` | Stay/Activity instead of Event; every other field matches | `event-match`, `stay-fails-category`, `activity-fails-category` |
| Search | `event-fails-search` | Theatre Session; no Music in title, description or location | `event-match`, `event-fails-search` |
| Location | `event-fails-location` | Kitwe instead of Lusaka; Music title still matches | `event-match`, `event-fails-location` |
| Minimum | `event-fails-minimum` | Price 99; below minimum, still below maximum | `event-match`, `event-fails-minimum` |
| Maximum | `event-fails-maximum` | Price 201; above maximum, still above minimum | `event-match`, `event-fails-maximum` |

With every constraint active, the literal expected ID list is always `["event-match"]`. The full combined exclusion test is at line 98; the five parameterized tests and relaxation expectations begin at lines 102 and 114. Relaxing a constraint keeps all other constraints active, so unrelated failing candidates must remain excluded. The dedicated fixtures do not alter the original characterization data or expected results.

## Predicate-omission evidence

A supplementary **in-memory** check executed the six new combined tests against the original helper and five modified copies. Copies omitted category, search, location, minimum or maximum respectively. Nothing was written to the helper or application files; installed TypeScript transpilation and Node assertions were used, with no additional package or saved test oracle.

| In-memory helper version | New combined tests failing |
|---|---:|
| Unmodified helper | 0 of 6 |
| Category predicate omitted | 6 of 6 |
| Search predicate omitted | 6 of 6 |
| Location predicate omitted | 6 of 6 |
| Minimum predicate omitted | 6 of 6 |
| Maximum predicate omitted | 6 of 6 |

This directly verifies that omitting any one predicate is detected by the strengthened combined tests. This finite omission check is not comprehensive mutation testing, nor an additional committed test suite. The durable regression count is 24.

## Existing assertion improvements and reset clarity

- The zero-minimum test now asserts literal expected IDs rather than computing its oracle using a second filter (`tests/explore/filterListings.test.ts:69`).
- The state-restoration assertion now lists the six expected IDs explicitly (`tests/explore/filterListings.test.ts:150`).
- The test at line 146 is named **“restoring default filter-state values restores results without exercising UI reset buttons”**. It supplies all five restored state values to the helper and checks the output. It does not invoke a component handler, render controls or simulate clicks.

No existing default, category/search/location/budget predicate, reset handler, UI rendering or validation rule was changed.

## Verification against Stage 1

| Command | Current result | Stage 1 comparison |
|---|---|---|
| `npm run test:explore` | Exit 0; 24 passed, 0 failed | Previously 18 passed; six new cases |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0; no diagnostics | Still passes |
| `npm run lint -- --format json --output-file TEMP/odini-stage1-corrections-eslint.json` | Exit 1; 6 errors, 15 warnings | Findings identical to prior Stage 1 JSON report |
| `npm run build` | Exit 0; compilation, TypeScript, page data/static generation complete | Still passes; route output unchanged |
| `git diff --check` | No whitespace errors | No regression |

Helper and test file both have zero ESLint errors/warnings. Existing unrelated errors and warnings were left intact. Compilation took 8.0 seconds, build TypeScript 10.8 seconds, static generation 3.7 seconds; timings are observations, not performance guarantees. Build used the existing authorized compiler-worker process access with telemetry disabled and no supplied Supabase values.

Baseline warnings persist: Node `MODULE_TYPELESS_PACKAGE_JSON` during test execution, and Next's ignored parent lockfile warning during build. No new warning was observed. Lockfile SHA-256 remains `942891194039c2fd2b6fe74237dd0ea7045a748cee2b71649f923159e37af562`. Git remains on the requested branch with the prior Stage 1 tracked diff unchanged.

## Remaining limitations

- Actual UI reset clicks, control defaults, destination options/count rendering, keyboard/mobile behaviour and browser navigation remain outside automated coverage. No React renderer or browser dependency was introduced.
- Tests run in one Node process with native TypeScript support under the existing command. Toolchain pinning, root TypeScript-option scope and module-warning follow-ups from the review remain unchanged.
- No live Supabase/query/RLS/schema/availability/auth/booking verification. Synthetic tests and successful build do not establish configured runtime data access.
- Numeric-validation quirks and current application behaviour are intentionally retained. Additional numeric edge cases noted in the review remain future characterization work; no new Explore feature has been implemented.

Corrections and verification are complete. Stop for review; do not begin Stage 2.
