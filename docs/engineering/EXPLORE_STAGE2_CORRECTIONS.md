# ODINI Stage 2 geographic ambiguity corrections

Date: 13 October 2026 (Africa/Lusaka). Branch: `feature/explore-city-filtering`.
Base checkpoint remains `f038f5b21ff9ac47118502968c87b5b43a766350`.

**Outcome:** all 67 tests pass; TypeScript and production build pass. ESLint retains six existing errors/fifteen warnings, with no new findings. Geographic corrections remain uncommitted for review.

## Scope and findings addressed

The High city/province-confidence finding and Medium contradictory-context/test-coverage findings in `EXPLORE_STAGE2_CODE_REVIEW.md` were addressed through conservative local rules and independent synthetic tests. No database, Supabase credentials, live listing corpus or external geographic API was accessed.

Files changed **during these corrections**:

- `lib/explore/locations.ts`: explicit leading-locality and neighbourhood rules plus destination-specific province/country context.
- `tests/explore/filterListings.test.ts`: 26 additional tests, preserving all previous 41 cases unchanged.
- `docs/engineering/EXPLORE_STAGE2_CORRECTIONS.md`: this report.

The component and filtering helper were not edited during this correction; their earlier uncommitted Stage 2 changes remain. Search/category/budget/reset and full listing data are untouched. No authentication, bookings, payments, host management, FYP, schema, environment or Supabase changes; no dependency installation, staging, commit, push, merge, deployment or Stage 3 work.

## Geographic rules

The six supported destinations remain **Lusaka, Livingstone, Kitwe, Ndola, Kafue and South Luangwa**. A literal expected-list test now guards that rollout list independently of the implementation.

Whole comma-separated tokens are still normalized for case and surrounding/repeated whitespace. Empty fragments are ignored. Classification now depends on token role and position, rather than the presence of any supported name anywhere:

1. A supported destination must be the leading nonempty token.
2. The only approved neighbourhood prefixes are **Roma, Kabulonga and Woodlands**, and each must be followed immediately by explicit **Lusaka**. A neighbourhood alone or paired only with Lusaka Province does not identify the city.
3. An unfamiliar/unsupported leading locality, including **Chongwe**, returns unknown even if later tokens contain Lusaka or Lusaka Province. No assumption that arbitrary localities are Lusaka neighbourhoods.
4. Every trailing token must be the same destination label, **Zambia**, or a specifically approved province context for that destination. All other context causes abstention, rather than being discarded.
5. Bare **Lusaka** is approved provincial shorthand only after leading **Kafue**. Thus `Kafue, Lusaka` is Kafue; the reverse `Lusaka, Kafue` is unresolved. This is an explicit locality-first rule, not a general preference for the first of multiple city names.
6. South Luangwa has no approved province association in this small rule set; an added province token returns unknown until a separate mapping is reviewed. Exact South Luangwa and South Luangwa with Zambia remain supported.

| Leading destination | Approved province context |
|---|---|
| Lusaka | Lusaka Province |
| Livingstone | Southern / Southern Province |
| Kitwe | Copperbelt / Copperbelt Province |
| Ndola | Copperbelt / Copperbelt Province |
| Kafue | Lusaka / Lusaka Province |
| South Luangwa | None inferred |

These tables and the three neighbourhood prefixes are explicit code constants in `lib/explore/locations.ts`; no broader district registry, geocoding or heuristics were introduced. Zambia is the only approved country context. A foreign country or unfamiliar province/context token is rejected through the allowlist; no complete international country list is necessary.

## Required examples and contradictions

| Input | Corrected result |
|---|---|
| Roma, Lusaka | Lusaka |
| Kabulonga, Lusaka, Zambia | Lusaka |
| Woodlands, Lusaka | Lusaka |
| Chongwe, Lusaka | Unknown |
| Chongwe, Lusaka Province | Unknown |
| Kafue, Lusaka | Kafue |
| Kafue, Lusaka Province | Kafue |
| Lusaka, Kitwe | Unknown |
| Roma, Lusaka, Zimbabwe | Unknown |
| Kitwe, Lusaka Province | Unknown |
| Unknown Settlement, Lusaka | Unknown |
| Unknown Settlement, Lusaka Province | Unknown |
| Livingstone, Southern Province | Livingstone |
| Kitwe, Copperbelt | Kitwe |

Other explicit negative tests cover reversed Kafue/Lusaka order, neighbourhood+wrong city, province-only neighbourhood pairing, inconsistent provincial contexts for Livingstone/Ndola, and foreign country following a consistent province. Additional positive cases cover capitalization/whitespace and consistent city/province/Zambia context.

## All locations, options and original addresses

Unknown/conflicting records remain eligible under **All locations**, subject to unchanged category/search/price predicates. Their full text remains searchable; for example Chongwe records are found with `search=chongwe`, and the contradictory Zimbabwe address remains searchable with category and budget filters applied.

Dropdown derivation uses the same corrected classifier, so ambiguous records do not create incorrect destination choices. The integration fixtures yield only Kafue and Lusaka from valid records; the unresolved-only subset yields an empty city-choice array, leaving All locations available in the unchanged component. Selecting Lusaka excludes the Chongwe, Kafue, foreign-country and other conflicting records. Selecting Kafue returns the two explicit Kafue locality forms. Selecting Kitwe excludes the inconsistent Kitwe/Lusaka Province record.

Addresses are not rewritten. Frozen records and object-identity/full-string assertions verify original text remains intact after both filtering and option derivation. Existing record ordering, sort/deduplication of options, category/search/zero/null/min/max handling and state restoration tests still pass.

## Tests

**67 passing tests**, consisting of the prior 41 plus **26 additions**:

- 22 individually named address/context cases with explicit expected labels or null.
- One literal assertion of the six-destination rollout list.
- Three integration tests: incorrect city exclusion with other filters active, options excluding conflicting records, and All/original-text search retention plus address immutability.

No previous test was deleted or weakened. Expected classifications and IDs are literal, not generated from normalization rules. Fixtures contain synthetic Stay, Event and Activity records only. No React renderer/browser package or database client is loaded.

## Verification

| Command/check | Result | Compared with the 41-test Stage 2 baseline |
|---|---|---|
| `npm run test:explore` | Exit 0; 67 passed, 0 failed/skipped/cancelled | Original 41 still pass, 26 new tests |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | Exit 0; no diagnostics | Still passes |
| `npm run lint -- --format json --output-file TEMP/odini-stage2-corrections-eslint.json` | Exit 1; 6 errors, 15 warnings | Findings identical by file/rule/severity/message |
| `npm run build` | Exit 0; compilation, TypeScript, page data/static generation complete | Still passes; routes unchanged |
| `git diff --check` | No whitespace errors | Clean |

The corrected utility and test file have zero lint findings. No unrelated lint fixes were made. Build compilation took 17.6 seconds, build TypeScript 5.9 seconds, and static generation approximately 1.1 seconds; these observations are not performance benchmarks. Existing Node module-detection and Next parent-lockfile warnings remain unchanged. Compiler workers ran with the previously authorized process access; telemetry was disabled for the build. No Supabase values were supplied.

Git remains on `feature/explore-city-filtering` with an empty index and the original Stage 1 checkpoint at HEAD. These corrections and all preceding Stage 2 work remain uncommitted; earlier untracked documentation was preserved.

## Limitations and decisions

- This rule set deliberately abstains on unknown address prefixes, even if a later city token might in reality be correct. Other Lusaka neighbourhoods, street/hotel descriptors, misspellings and different token order/delimiters remain unmapped unless explicitly reviewed.
- Country/province context must use the listed forms. Additional country aliases, administrative abbreviations or South Luangwa province associations require review, not automatic inference.
- `Kafue, Lusaka` is accepted on the explicit locality-first policy authorized by the request. Bare Lusaka elsewhere is not a generic province alias. No additional approval was needed to implement this small, justified rule.
- Unsupported locality prefixes such as Chongwe are not classified by scanning later tokens. Unknown geography stays available under All/search, but may reduce the dropdown's coverage. A representative sanitized address sample is still needed before rollout to measure coverage.
- No browser reset-click or accessibility/mobile walkthrough, live schema/RLS/data verification, geocoding, coordinates or production requests occurred. Pure tests do not establish deployed runtime success.
- Existing native-TypeScript module warning, in-process test execution/toolchain pinning limitations and pre-existing lint debt remain. Runtime values violating the declared string|null contract are not a newly expanded scope.

Stop after verification for review. Do not commit or begin Stage 3 automatically.
