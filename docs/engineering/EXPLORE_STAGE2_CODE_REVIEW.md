# ODINI Stage 2 independent code review

Date: 13 October 2026 (Africa/Lusaka). Branch: `feature/explore-city-filtering`.
Reference: Stage 1 checkpoint `f038f5b21ff9ac47118502968c87b5b43a766350`.

## Verdict: REQUEST CHANGES

The implementation is small, pure and largely faithful to the approved scope. All **41 tests pass** in this review. Whole-token matching, deduplicated options, original location preservation and unchanged nonlocation predicates are verified. However, the parser cannot distinguish a supported city name from the same name used as a province. It can silently classify an ambiguous address as Lusaka city when its actual locality is outside the supported list. That conflicts with the requirement not to assign ambiguous locations to a city.

**Not ready for a Stage 2 checkpoint commit.** Correct the city/province confidence rules and add adversarial regression tests before approval. Do not broaden the city list or introduce geocoding/database changes merely to mask the problem. No corrections were applied during this review.

## Evidence and scope

**Verified** means source inspection or executed local command. **Inference** describes plausible product consequences without live data. **Unknown** means runtime/catalog evidence unavailable. The original Stage 1 source was obtained through Git comparisons, not treated as established solely by the implementation report.

Read-only commands included branch/status, `git diff <checkpoint>`, `--stat`, `--name-only`, `--check`, `git ls-files --others --exclude-standard`, and no-index comparisons against Windows `NUL` for the untracked utility/report. Stage 2 has three modified tracked files, a new utility and a new implementation report. Earlier untracked baseline/assessment documents were inventoried as pre-existing work and remain untouched. The Git index is empty.

| Reviewed file | Evidence |
|---|---|
| `app/user/ListingsClient.tsx` | Only new destination-options import and replacement of dropdown option derivation |
| `lib/explore/filterListings.ts` | Only new utility import and changed Where predicate relative to checkpoint |
| `lib/explore/locations.ts` | Full untracked 37-line implementation reviewed through source and no-index diff |
| `tests/explore/filterListings.test.ts` | Full suite and checkpoint diff: 24 retained cases, one explicitly revised location expectation, 17 new cases |
| `docs/engineering/EXPLORE_STAGE2_CITY_FILTERING.md` | Full report reviewed; its geographic limitations do not establish safe classification |

Diff checks against authentication, bookings, payments/host-related source paths, FYP, Supabase clients, proxy, server query/page, manifests, lockfile and tsconfig found no changes. No additional dependencies or database interaction were introduced. No whitespace errors were found; LF/CRLF notices are Git advisories.

Only this review report was created. No application/test/config edits, packages, Supabase access, migrations, commits, staging, push, merge, deployment or Stage 3 work occurred.

## Verified functional findings

| Requirement | Finding and exact references |
|---|---|
| Explicit mapping | Six labels: Lusaka, Livingstone, Kitwe, Ndola, Kafue, South Luangwa; readonly literal union. `lib/explore/locations.ts:3–7` |
| Whole-token matching | Comma split, trim, whitespace collapse, lowercase, exact Set membership; no substring in Where. `locations.ts:9–18` |
| Required examples | Exact city, Roma/Woodlands/Kabulonga with Lusaka, Livingstone with Southern Province and Kitwe with Copperbelt pass. `tests/explore/filterListings.test.ts:156–181` |
| Ambiguity rule currently implemented | More than one distinct **supported destination label** returns null; repeated same label does not. This is narrower than geographic ambiguity. `locations.ts:16–22`, tests:189–195 |
| Unknown/ambiguous under All | Literal all bypasses location matching; other predicates still apply. Fixture tests retain unknown, ambiguous, embedded-name and null records. `lib/explore/filterListings.ts:30`, tests:231–235 |
| Options | Canonical labels, Set deduplication, default alphabetical sort; computed from complete listings prop before other filters. `locations.ts:30–36`, component:50–53, tests:215–219 |
| Full locations | Utilities read but do not assign to records; cards still render listing.location. Frozen fixtures and identity assertions pass. `app/user/ListingsClient.tsx:255–258`, tests:238–245 |
| Other filters | Category, trim/lowercase full-field search, inclusive min/max, zero/null handling and AND return unchanged in Git diff. `lib/explore/filterListings.ts:24–45` |
| Reset | Existing five setters and both bindings unchanged. `app/user/ListingsClient.tsx:67–73,163,209`; state-restoration test:149–154. No button-click test claimed |

The partial `Lusa` selector remains rejected; lowercase/outer-whitespace city selectors now match as deliberately approved. The historical exact-location test was transparently updated at tests:52–58, not silently removed. The raw free-text field remains the only inspected discovery location contract (`app/user/action.ts:19–28`, component:15); no separate city/province columns were assumed.

## Findings by severity

### High: city/province ambiguity can produce a false city assignment

**Location:** `lib/explore/locations.ts:16–22`, consumed by `filterListings.ts:30` and dropdown options at `locations.ts:34`.

Fresh in-memory executions of the actual utility produced:

| Input | Actual result | Review implication |
|---|---|---|
| `Chongwe, Lusaka` | Lusaka | Could be locality plus province; unsupported locality is treated as irrelevant context |
| `Chongwe, Lusaka Province` | null | Explicit province suffix changes classification of otherwise equivalent administrative context |
| `Kafue, Lusaka` | null | Both labels are supported, so the same province shorthand is rejected rather than assigned |
| `Kitwe, Lusaka Province` | Kitwe | Explicit geographic context is not validated at all |

Chongwe and Kafue are separate districts/localities within Lusaka Province, which makes province-role ambiguity realistic rather than a contrived substring example. See the official [Lusaka Provincial Administration](https://www.lsk.gov.zm/) and [Chongwe Municipal Council](https://www.chongwecouncil.gov.zm/). **Inference:** a host could write locality/province without the Province suffix. Whether such records actually exist in ODINI is unknown; their unsafe classification is reproducible without Supabase.

The algorithm equates “exactly one supported label” with “confident city”. Absence of Chongwe from six rollout destinations is not evidence that it is a Lusaka neighbourhood. Options and matching therefore inherit the same incorrect confidence. Multiple-label rejection protects `Lusaka, Kitwe`, but not an unsupported locality followed by a supported province-name token.

**Required correction:** establish explicit, reviewable city-versus-province/context rules while preserving the requested neighbourhood examples. Do not guess that arbitrary preceding tokens are neighbourhoods. Use reviewed contextual mappings/disambiguation where warranted; return unknown when role cannot be resolved safely. Known unsupported localities must not become a supported city just because their province shares its name. Leave unresolved records available under All/search. Add tests for locality/province shorthand and explicit province forms, in both matching and options, documenting how true city-city conflicts differ. This requires no live database or new dependency.

### Medium: contradictory geographic context is ignored

**Location:** `lib/explore/locations.ts:16–22`; current province/country tests at `tests/explore/filterListings.test.ts:170–175` cover only consistent examples.

The review probe `Roma, Lusaka, Zimbabwe` returns Lusaka. Any unrecognized token is discarded as descriptive context even when it is an explicit contradictory country. Likewise the parser accepts a supported city with arbitrary provincial context. This is a verified lexical result, not proof of a real foreign listing.

**Required correction/product decision:** document and test what makes geographic context conflicting rather than descriptive. A Zambia-first mapper should abstain on known explicit contradictions instead of asserting confidence. Resolve this with a small approved set of context rules, not unrestricted heuristics or a complete international geocoder. If tolerance of contradictory fields is deliberately wanted, obtain explicit product approval and label classification confidence honestly; the implementation report's limitation alone does not waive the no-ambiguous-assignment requirement.

### Medium: tests do not guard the administrative ambiguity above

**Location:** `tests/explore/filterListings.test.ts:170–195,215–219`.

Current ambiguity tests include two supported destinations or entirely unrecognized text. They do not include supported-name-as-province after an unsupported locality, contradictory country, or province-label variants. Thus 41 passing tests can coexist with the High finding. **Required correction:** add independent expected outcomes for these cases and verify false classifications cannot populate the dropdown or appear under the wrong city, while All still retains their records.

### Low: format/coverage restrictions can sharply reduce useful choices

**Location:** `locations.ts:3–4,16,35`; component:104–114.

`Lusaka; Zambia`, `Kabulonga Lusaka Zambia` and slash-separated prose are unmapped. Unsupported destinations, missing city names and misspellings are omitted from the dropdown. This restriction was documented and conservative abstention is preferable to substring guessing. However, unlike Stage 1's options, an entirely unmapped catalog produces only All locations, with no explanation of why available listings have no city choices. **Inference:** Where may become less useful for heterogeneous host addresses; actual mapping coverage cannot be measured without a representative sanitized corpus.

**Recommendation:** before rollout, review representative de-identified location strings and measure mapped/ambiguous/unmapped coverage. Approve any additional formats or destinations explicitly. Do not broaden delimiters or neighbourhood guessing automatically. Text search still matches original locations and all listings remain eligible under All.

### Low: non-string runtime values are not guarded

**Location:** `locations.ts:13–16`, `getDestinationOptions:34`.

Fresh probes with a positive number, object or array throw `location.split is not a function`; declared input is string|null, so these values violate the typed contract. Stage 1 option derivation already called trim on non-null values and would also fail, so this is **not a demonstrated new regression**. Unknown live schema/DTO guarantees prevent calling it an actual production defect. Blank/null strings work; repeated/empty comma fragments such as `Lusaka,,Zambia` are accepted as containing a city token.

**Recommendation:** decide whether to enforce the DTO boundary or make normalization defensively return unknown for invalid runtime values. Document tolerance of empty tokens separately from genuine locality/province ambiguity. Do not count arbitrary malformed runtime shapes as valid data without a verified contract.

Critical findings: **none**. Existing lint debt is not introduced by Stage 2.

## Test quality and design

**Verified:** `npm run test:explore` exits 0 with 41 passed, zero failed/skipped/cancelled. Tests import the actual utility/helper, use only frozen synthetic listings, and preserve the 24-case Stage 1 coverage including independent combined-constraint candidates. The 17 new cases substantively check exact supported labels, contextual examples, whitespace/case, unknowns, lexical ambiguities, false substrings, options, cross-category matching, full-data preservation and All restoration.

Expected IDs are generally explicit and meaningful. The six exact-label cases iterate the implementation's supported list; other explicit contextual/option assertions independently exercise the intended labels, so this is not by itself a false-positive defect. Nonetheless an explicit expected rollout-list assertion would clarify taxonomy review. The main quality gap is geographic interpretation, not lack of assertions or repeated happy paths.

Full-location identity/order is checked at data level; component render text is reviewed unchanged, not browser-tested. Reset restoration supplies state values, not real button clicks. Dropdown keyboard behaviour, option discoverability, count/error rendering and combined controls remain component/browser follow-ups. No React renderer was introduced and no test accidentally loads auth/booking/host modules.

The TypeScript utility is simple and maintainable: small functions, readonly list/type union, generic filter preserving original records, no service or transport abstraction. Its key weakness is the confidence model, not code complexity. Do not solve the geographic finding with a broad unreviewed taxonomy.

## Performance, accessibility and verification limits

Options remain memoized by listings prop. Filtering with a selected city now creates normalized token Sets and scans six destination labels per listing, on each filter change: linear catalog work with a small fixed label count. Default All short-circuits that matching work. No sorting of records, network calls or persistence was added. No significant performance regression was demonstrated; no large-catalog benchmark or live scale evidence exists. The existing unbounded base query remains prior debt (`app/user/action.ts:17–31`).

No new JSX, custom widget, layout or focus change appears in the diff. The native location select still lacks an explicit label/aria-label at `app/user/ListingsClient.tsx:103–107`, as in Stage 1; it is pre-existing accessibility debt, not a new regression. Fewer canonical choices can improve scanability, but incorrect/absent choices are the substantive new user-experience risk. Actual mobile/assistive-technology behaviour was not exercised.

This review freshly ran tests and in-memory utility probes only. TypeScript/build pass and six lint errors/fifteen warnings were recorded by the implementation stage; they were not rerun in this review. No build artifacts, test files or application source were written. Node's pre-existing module-detection warning reappeared. No Supabase catalog, rows, policies, geographic field semantics or deployed browser state was inspected.

## Required corrections and checkpoint readiness

1. Correct or explicitly abstain on city/province-role ambiguity, including unsupported locality plus bare Lusaka province context; preserve the six approved illustrative input formats.
2. Define conservative handling of explicit contradictory geography and add independent adversarial tests for classification, options, city matching and All retention.
3. Rerun the full suite, TypeScript, lint and build, retaining existing nonlocation behaviour and documenting any new product decision. Do not alter auth, bookings, FYP or database configuration.

After those corrections are reviewed, Stage 2 can be considered for an explicitly approved local checkpoint. **Current answer: no, not ready to checkpoint.** Unsupported-format coverage, corpus measurement, actual UI interaction tests and pre-existing accessibility debt can remain documented follow-ups if the confidence defect is fixed. No commit or Stage 3 work is authorized by this review.
