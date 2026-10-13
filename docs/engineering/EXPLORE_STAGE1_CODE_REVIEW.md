# ODINI Stage 1 code review

Date: 13 October 2026 (Africa/Lusaka). Branch: `test/explore-regression-baseline`.

## Verdict: APPROVE WITH CHANGES

**Verified:** the extraction preserves the original Explore predicates, ordering and reset wiring. No application-behaviour regression or new external dependency was found. All 18 tests pass in the reviewed workspace. The main corrections concern the strength of the regression guard: the combined-filter fixture does not independently exercise every constraint, and the reset test cannot catch a broken component reset handler. Address these coverage limitations before relying on this suite as the sole gate for Stage 2. No Critical or High findings.

This review used Git's original source, not the previous reports as its behavioural oracle. Source findings and command results are marked **Verified**; proposed follow-ups are **Recommendations**; runtime/database capabilities not exercised are **Unknown**. The review report is the only file changed by this review. No staging, source/test/config edits, package installation, database access, migration, commit, merge, push or deployment was performed. Stage 2 was not started.

## Git evidence and files reviewed

Reference commit: `face65a68a7e7c03ece88d66d56bccb2b3ea1206` (current HEAD). Original component read through `git show HEAD:app/user/ListingsClient.tsx`. Stage 1 changes remain uncommitted, so `HEAD` is the original implementation, not a Stage 1 snapshot. Authorship of the original commit is not independently established; it is the source the user identifies as Nephas's implementation.

Commands inspected: `git status --short`, `git branch --show-current`, `git diff`, `git diff --stat`, `git diff --numstat`, `git diff --check`, `git ls-files --others --exclude-standard`, `git show`, and `git diff --no-index --stat -- NUL <path>` for **every existing untracked file**. `NUL` is the Windows empty-file source. Untracked helper/test/report contents were read explicitly; no-index whitespace checks were also run on the three Stage 1 new files. No whitespace errors were reported. Git emitted LF-to-CRLF advisory warnings, which are not source errors. No-index comparisons showing additions are expected to return a difference status, not a test failure.

Tracked diff: three files, seven insertions and 22 deletions. The final component newline is the only change outside its import/filter call. `git diff HEAD -- package-lock.json app/user/page.tsx app/user/action.ts` was empty.

| File | Review scope |
|---|---|
| `app/user/ListingsClient.tsx` | Full current component and original HEAD; import, state, predicates, warning, reset and render bindings |
| `lib/explore/filterListings.ts` | Full new pure implementation, 45 lines |
| `tests/explore/filterListings.test.ts` | Full new synthetic suite, 111 lines; 18 executed cases |
| `package.json` | Added script, unchanged package dependencies, no module type/toolchain pin |
| `tsconfig.json` | Added extension-import option and existing noEmit/include settings |
| `docs/engineering/EXPLORE_REGRESSION_BASELINE.md` | Full Stage 1 report; claims checked against source/review commands |
| `app/user/page.tsx`, `app/user/action.ts`, `package-lock.json` | Unchanged source/data boundary and dependency scope |

Complete pre-review untracked inventory additionally includes `docs/engineering/LOCAL_DEVELOPMENT_BASELINE.md` and these four existing background reports:

- `docs/odini-assessment/ODINI_FIGMA_PRODUCT_SPECIFICATION.md`.
- `docs/odini-assessment/ODINI_EXPLORE_TECHNICAL_SPECIFICATION.md`.
- `docs/odini-assessment/ODINI_IMPLEMENTATION_GAP_ANALYSIS.md`.
- `docs/odini-assessment/ODINI_EXPLORE_IMPLEMENTATION_PLAN.md`.

These were existing assessment/background artifacts, not extra Stage 1 application changes. They were explicitly inventoried through no-index comparisons and used only as contextual documentation. They remain untouched. The only executable untracked files are the helper and test listed above; ordinary git diff would have omitted them.

## Behaviour-preservation findings

Original line references below refer to **Git HEAD**, current/helper references to the working tree.

| Check | Verified result | Exact evidence |
|---|---|---|
| Category | Same exact singular listing_type equality; `all` disables predicate | HEAD component:63; helper:27 |
| Search | Same trim/lowercase and case-insensitive substring across title/description/location; empty query matches all | HEAD:67–72; helper:30–35; tests:37–48 |
| Location | Same trimmed listing full-string equality, case-sensitive; selected value untrimmed; `all` disables predicate | HEAD:65; helper:28; tests:51–55 |
| Minimum/maximum | Same empty-string→null, otherwise Number conversion, inclusive >= and <= | HEAD:57–60,78–80; helper:22–24,37–41; tests:58–69 |
| Free price | Zero remains numeric; max=0 includes free records | helper:22–24,39–41; tests:66–69 |
| Null price | Included without bounds, excluded with either bound; not coerced to free | HEAD:76–80; helper:37–41; tests:72–75 |
| Combination | Same AND across category/location/search/price | HEAD:83; helper:43 |
| Reset connection | Five original setters unchanged; both original buttons still invoke clearFilters | HEAD:89–95,184,229; current component:70–76,166,212 |
| Order | Array.filter retained, no sort/reverse; input order preserved | HEAD:62; helper:26; tests:87–93 |
| Record mutation | No writes to input array/records; matching original objects returned | helper:18–45; frozen fixtures tests:6–13 and identity assertions:91–93 |
| Pure boundary | No imports, React hooks, Next APIs, Supabase clients or side effects | helper:1–45 |

Current component:63–65 passes precisely the five existing state values. Its destination option derivation, hasAnyFilter logic, warning condition and JSX remain unchanged. Bounds are converted again inside the helper, but for the actual string state this gives the same numbers and does not change output. The generic preserves the component's complete listing shape; the readonly input type expresses nonmutation without freezing or copying records at runtime.

**Additional independent check:** in memory, the original predicate block was taken directly from Git HEAD and evaluated against the extracted helper over **11,520 synthetic filter combinations**. Category included all/three types/unknown; search included empty, whitespace, text and no-match; location included exact/case/whitespace/null-relevant cases; each bound included empty, zero, finite boundaries, malformed, negative and Infinity values. Ordered record identities agreed for every combination. Inputs were frozen synthetic Stay/Event/Activity records. No test file or application code was changed by this probe. This finite comparison strengthens evidence but is not a formal proof for malformed listing shapes, accessors or every JavaScript value.

The first attempt to obtain Git source inside Node was blocked by child-process `EPERM`; the successful probe passed `git show` output from PowerShell into the Node process environment. This was a local execution restriction, not a source defect. No temporary source files or database calls were needed.

## Test quality

**Strengths:** expected IDs independently specify category, search, location and boundary output; tests import the real helper, not a copied predicate. Frozen records and array plus strict identity assertions catch mutation/sorting/cloning of matching records. The reversed-input test prevents accidentally accepting fixture order as an imposed sort. Fixture dates, network, environment, auth, production records and clocks are absent. Three category cases are generated separately; the observed total is genuinely 18 tests, not 18 assertions.

**Medium — combined-filter false-positive risk.** `tests/explore/filterListings.test.ts:78–80`, fixtures:7–12. Both events already contain “Music” and both are in Lusaka. Removing the search or location predicate **only when other filters are active** would leave this test green. A zero-price event is excluded by minimum alone, and there is no event above maximum, so maximum omission also goes undetected in this combined case. The individual tests catch globally deleted predicates, but do not close this interaction gap. **Recommendation:** add synthetic candidates matching all constraints except exactly one (category, search, location, minimum, maximum), and an explicit combined exclusion case. No new dependency or live database is necessary.

**Medium — reset/default integration is not exercised.** Test:106–110 manually constructs the restored values. It would still pass if the UI reset handlers stopped clearing a field, or component defaults changed. Source review confirms current wiring is correct, and the report already acknowledges this limitation at `docs/engineering/EXPLORE_REGRESSION_BASELINE.md:90`; this is a coverage gap, not a proven broken reset. **Recommendation:** add a future component interaction test for each reset entry point using synthetic props: alter all five controls, click reset, assert control values/count/results. Do not load the server page or require Supabase. Any additional renderer/browser dependency needs separate approval. Until then, retain a review checklist for component defaults/setters/bindings and label this test “filter-state restoration” rather than UI reset verification.

**Low — partial overlap and weak expected-value construction.** Tests:23–24,66–75 overlap default/null/minimum coverage, which is acceptable for readable characterization and not harmful duplication. The zero-minimum expected list at line 69 is calculated with a null-price filter; literal expected IDs would make a future accidental fixture edit more visible. The reset expected array checks returned data but does not represent real interaction. No snapshot or private implementation access is used; importing a public pure function is appropriate unit-test coupling.

**Additional untested edges (Low):** decimal boundaries, malformed maximum, numeric-whitespace-as-zero, infinities in both directions, empty-string listing locations and independent lowercase/mixed-case null-field searches. Some were exercised by the review matrix but are not durable regression cases. No need to expand invalid DTO shapes outside the declared contract. Destination derivation/count display, price warning rendering, card navigation, keyboard/mobile behaviour and UI/server error distinction require separate component/browser or integration tests.

## TypeScript configuration assessment

**Verified purpose:** `tsconfig.json:9` permits the explicit `.ts` import in `tests/explore/filterListings.test.ts:3`. Node's native loader needs a file extension and does not honor TypeScript path aliases. The application helper import remains extensionless at `app/user/ListingsClient.tsx:6`.

**Necessity in the current design was tested without editing configuration:** TypeScript compiler programs were built in memory with incremental output disabled. Current options produced **0 diagnostics**. Turning this option off only in memory produced exactly **TS5097** at the test import. Thus it is necessary for checking the current test source under this root configuration; it is not necessary for Node runtime execution itself.

The option is compatible with the current `noEmit: true` at `tsconfig.json:8`; it does not change filter semantics, transpile `.ts` paths, enable JSX in Node or introduce a runtime dependency. TypeScript describes the option's noEmit/declaration-only constraints in [allowImportingTsExtensions](https://www.typescriptlang.org/tsconfig/allowImportingTsExtensions.html). Existing bundler module resolution is unchanged.

**Low — wider configuration scope than the test import needs.** Root inclusion covers the tests, so both Next build type-checking and future root-config tooling see the flag. Current source checking passes; the prior Stage 1 build passed, but it was not repeated during this read-only review. Future tools emitting JavaScript need an appropriate override/rewrite strategy rather than assuming `.ts` paths become runnable emitted imports. Do not treat this as a currently failing Next build.

**Less intrusive alternatives:** use a dedicated test tsconfig with the extension option and separately exclude/type-check tests outside the app config, or use an `.mjs` test with native imports (losing direct TypeScript checking of test code). Both require additional changes; the user explicitly requested a `.test.ts` file. The one-line root option is defensible for this small foundation, and removing it without a replacement breaks checking. **Recommendation:** retain it for Stage 1; isolate configs if tooling/emit requirements expand. Do not change the project's module type just to silence a warning.

## Test-runner assessment

Command at `package.json:10`: `node --test --test-isolation=none tests/explore/filterListings.test.ts`. **Verified on installed Node 24.13.0:** exit 0, 18 passed, zero failed/skipped/cancelled. `MODULE_TYPELESS_PACKAGE_JSON` was reproduced because `.ts` ESM syntax is detected while the project has no explicit module type. It is a module-detection overhead warning, not a test failure.

Native stripping is stable from Node 24.12, does not type-check, ignores tsconfig aliases and does not support `.tsx`; the helper/test use only supported erasable syntax and relative explicit imports. See [Node 24 TypeScript documentation](https://nodejs.org/docs/latest-v24.x/api/typescript.html). Existing TypeScript 5.9.3 independently checks them; no tsx/Vitest/Jest/DOM package is needed.

**Low — reproducibility/isolation contract.** Package scripts have no engines/packageManager pin. Next's own Node minimum is not sufficient to establish compatibility with this test command. Recommend documenting/enforcing the verified Node 24.13.0 baseline in an approved toolchain follow-up. Do not assume all Node 22 versions support this spelling: the test-isolation flag was renamed at v23.6 per the [versioned Node 24.13 CLI](https://nodejs.org/download/release/v24.13.0/docs/api/cli.html#--test-isolationmode). Only Node 24.13 was executed here.

`none` runs test files in the runner's process rather than a child process. It avoids sandbox spawn restrictions but does not isolate globals/module caches. With one pure test file, frozen fixtures and only built-in/helper imports, no present cross-suite state leak was found. Import isolation from auth/bookings is verified; process isolation is intentionally absent. Reconsider default process isolation when multiple or stateful suites are added. Do not silently widen this explicit single-file command and assume suites remain independent.

## Severity and verification summary

| Severity | Finding | Required response |
|---|---|---|
| Critical | None found | — |
| High | None found | — |
| Medium | Combined-filter fixture cannot independently detect omitted constraints | Strengthen synthetic interaction cases before using suite alone for combined-filter changes |
| Medium | Manual reset-state test cannot detect changed component wiring/defaults | Track UI regression requirement; exercise before modifying reset/default behaviour |
| Low | Root extension option affects future emit/tooling scope | Retain currently valid setup; isolate when tooling needs it |
| Low | Node version unpinned, module warning and shared-process execution | Document verified environment; revisit for CI/multiple suites |
| Low | Overlap, computed expectations and sparse numeric edges | Improve incrementally without implementing new validation |

Fresh checks: tracked/untracked diff inspection and whitespace checks, 18-test rerun, 11,520-case Git-original comparison, in-memory current TypeScript check and option-removal diagnostic experiment. Prior baseline lint/build results are **historical evidence** from `docs/engineering/EXPLORE_REGRESSION_BASELINE.md:77–84`: build passed, lint had six existing errors/fifteen warnings. They were not rerun here; no generated build outputs were requested or created by this review. No lint or build regression is inferred merely from prior success.

## Stage 2 readiness and unknowns

**Conditional readiness:** the extracted function is suitable as a behaviour-preserving foundation. After user review/approval, a small database-free Explore change can be scoped. Strengthen combined-filter cases before changing combination semantics; add an approved component/browser gate before changing defaults/reset wiring. The present suite alone is insufficient to claim end-to-end Explore preservation. The verdict does not authorize implementation or introduce an automatic requirement to install packages.

**Unknown without configured runtime/Supabase:** live listings, schema relationships, RLS/policies, event timestamps/availability, tags and data visibility. No such access occurred. Therefore Stage 2 must not assume category-wide When, Vibe or recommendations are database-ready. Source-auth/reset wiring can be reviewed without Supabase, and synthetic component tests can likewise be built without it. Full deployed/data integration remains a separate verification gate.

Only this review report has been added. Wait for explicit approval; do not begin Stage 2 or apply the recommended corrections during this review.
