import { test } from "node:test"
import { strict as assert } from "node:assert"
import { filterListings, type ExploreFilters } from "../../lib/explore/filterListings.ts"

// Entirely synthetic records. No application pages, services or fixtures are imported.
const listings = Object.freeze([
  Object.freeze({ id: "stay-city", listing_type: "stay", title: "City Rest", description: "Quiet garden", location: " Lusaka ", price: 100 }),
  Object.freeze({ id: "event-free", listing_type: "event", title: "Community Music", description: null, location: "Lusaka", price: 0 }),
  Object.freeze({ id: "activity-river", listing_type: "activity", title: "River Walk", description: "Guided nature trail", location: "Livingstone", price: 50 }),
  Object.freeze({ id: "stay-unknown", listing_type: "stay", title: "Hill Rest", description: null, location: null, price: null }),
  Object.freeze({ id: "event-paid", listing_type: "event", title: "Evening Music", description: "Garden performance", location: "Lusaka", price: 100 }),
  Object.freeze({ id: "activity-city", listing_type: "activity", title: "City Tour", description: "Walking tour", location: "Lusaka", price: 200 }),
])

const defaults: ExploreFilters = {
  category: "all", search: "", location: "all", minPrice: "", maxPrice: "",
}

function ids(filters: Partial<ExploreFilters> = {}) {
  return filterListings(listings, { ...defaults, ...filters }).map((listing) => listing.id)
}

test("default filters and All retain every listing including null prices", () => {
  assert.deepEqual(ids(), listings.map((listing) => listing.id))
})

for (const [category, expected] of [
  ["stay", ["stay-city", "stay-unknown"]],
  ["event", ["event-free", "event-paid"]],
  ["activity", ["activity-river", "activity-city"]],
] as const) {
  test(`category ${category} matches only that category`, () => {
    assert.deepEqual(ids({ category }), expected)
  })
}

test("search matches title substrings case-insensitively", () => {
  assert.deepEqual(ids({ search: "mUsIc" }), ["event-free", "event-paid"])
})

test("search matches descriptions and locations case-insensitively", () => {
  assert.deepEqual(ids({ search: "GARDEN" }), ["stay-city", "event-paid"])
  assert.deepEqual(ids({ search: "LIVINGSTONE" }), ["activity-river"])
})

test("search trims surrounding whitespace and ignores whitespace-only queries", () => {
  assert.deepEqual(ids({ search: "  music \t" }), ["event-free", "event-paid"])
  assert.deepEqual(ids({ search: " \t\n " }), ids())
})

test("location matches the exact trimmed listing value", () => {
  assert.deepEqual(ids({ location: "Lusaka" }), ["stay-city", "event-free", "event-paid", "activity-city"])
  assert.deepEqual(ids({ location: "Lusa" }), [])
  assert.deepEqual(ids({ location: "lusaka" }), [])
  assert.deepEqual(ids({ location: " Lusaka " }), [])
})

test("minimum price is inclusive and excludes null prices", () => {
  assert.deepEqual(ids({ minPrice: "100" }), ["stay-city", "event-paid", "activity-city"])
})

test("maximum price is inclusive and excludes null prices", () => {
  assert.deepEqual(ids({ maxPrice: "100" }), ["stay-city", "event-free", "activity-river", "event-paid"])
})

test("zero price and zero bounds are valid", () => {
  assert.deepEqual(ids({ maxPrice: "0" }), ["event-free"])
  assert.deepEqual(ids({ minPrice: "0", maxPrice: "0" }), ["event-free"])
  assert.deepEqual(ids({ minPrice: "0" }), ["stay-city", "event-free", "activity-river", "event-paid", "activity-city"])
})

test("null prices remain visible without a bound and disappear with either bound", () => {
  assert.deepEqual(ids({ category: "stay" }), ["stay-city", "stay-unknown"])
  assert.deepEqual(ids({ category: "stay", minPrice: "0" }), ["stay-city"])
  assert.deepEqual(ids({ category: "stay", maxPrice: "200" }), ["stay-city"])
})

test("category, search, location and both price bounds combine with AND", () => {
  assert.deepEqual(ids({ category: "event", search: " MUSIC ", location: "Lusaka", minPrice: "100", maxPrice: "100" }), ["event-paid"])
})

// Each rejected record differs from the matching event in exactly one constraint.
// Separate fixtures leave the original 18 characterization tests unchanged.
const combinedListings = Object.freeze([
  Object.freeze({ id: "event-match", listing_type: "event", title: "Music Session", description: null, location: "Lusaka", price: 150 }),
  Object.freeze({ id: "stay-fails-category", listing_type: "stay", title: "Music Session", description: null, location: "Lusaka", price: 150 }),
  Object.freeze({ id: "activity-fails-category", listing_type: "activity", title: "Music Session", description: null, location: "Lusaka", price: 150 }),
  Object.freeze({ id: "event-fails-search", listing_type: "event", title: "Theatre Session", description: null, location: "Lusaka", price: 150 }),
  Object.freeze({ id: "event-fails-location", listing_type: "event", title: "Music Session", description: null, location: "Kitwe", price: 150 }),
  Object.freeze({ id: "event-fails-minimum", listing_type: "event", title: "Music Session", description: null, location: "Lusaka", price: 99 }),
  Object.freeze({ id: "event-fails-maximum", listing_type: "event", title: "Music Session", description: null, location: "Lusaka", price: 201 }),
])

const combinedFilters: ExploreFilters = {
  category: "event", search: " MUSIC ", location: "Lusaka", minPrice: "100", maxPrice: "200",
}

test("combined filters exclude every candidate failing a single active constraint", () => {
  assert.deepEqual(filterListings(combinedListings, combinedFilters).map((listing) => listing.id), ["event-match"])
})

const independentConstraints: {
  constraint: string
  relaxedFilter: Partial<ExploreFilters>
  expectedIds: string[]
}[] = [
  { constraint: "category", relaxedFilter: { category: "all" }, expectedIds: ["event-match", "stay-fails-category", "activity-fails-category"] },
  { constraint: "search", relaxedFilter: { search: "" }, expectedIds: ["event-match", "event-fails-search"] },
  { constraint: "location", relaxedFilter: { location: "all" }, expectedIds: ["event-match", "event-fails-location"] },
  { constraint: "minimum price", relaxedFilter: { minPrice: "" }, expectedIds: ["event-match", "event-fails-minimum"] },
  { constraint: "maximum price", relaxedFilter: { maxPrice: "" }, expectedIds: ["event-match", "event-fails-maximum"] },
]

for (const { constraint, relaxedFilter, expectedIds } of independentConstraints) {
  test(`combined ${constraint} constraint independently excludes its candidates`, () => {
    assert.deepEqual(filterListings(combinedListings, combinedFilters).map((listing) => listing.id), ["event-match"])
    // Relax only this constraint; all other constraints must still exclude their candidates.
    assert.deepEqual(filterListings(combinedListings, { ...combinedFilters, ...relaxedFilter }).map((listing) => listing.id), expectedIds)
  })
}

test("no matches and an empty input return empty results", () => {
  assert.deepEqual(ids({ search: "nonexistent synthetic listing" }), [])
  assert.deepEqual(filterListings([], defaults), [])
})

test("filtering preserves original order, objects and input without mutation", () => {
  const reversed = Object.freeze([...listings].reverse())
  const result = filterListings(reversed, { ...defaults, search: "music" })
  assert.deepEqual(result.map((listing) => listing.id), ["event-paid", "event-free"])
  assert.equal(result[0], listings[4])
  assert.equal(result[1], listings[1])
  assert.deepEqual(reversed.map((listing) => listing.id), [...listings].reverse().map((listing) => listing.id))
})

test("an inverted range preserves the current empty-result behaviour", () => {
  assert.deepEqual(ids({ minPrice: "200", maxPrice: "100" }), [])
})

test("existing Number conversion is preserved without adding validation", () => {
  assert.deepEqual(ids({ minPrice: "not-a-number" }), [])
  assert.deepEqual(ids({ maxPrice: "-1" }), [])
  assert.deepEqual(ids({ minPrice: " 100 " }), ids({ minPrice: "100" }))
})

test("restoring default filter-state values restores results without exercising UI reset buttons", () => {
  const changed = { ...defaults, category: "event", search: "music", location: "Lusaka", minPrice: "100", maxPrice: "100" }
  assert.deepEqual(filterListings(listings, changed).map((listing) => listing.id), ["event-paid"])
  const reset = { ...changed, category: "all", search: "", location: "all", minPrice: "", maxPrice: "" }
  assert.deepEqual(filterListings(listings, reset).map((listing) => listing.id), ["stay-city", "event-free", "activity-river", "stay-unknown", "event-paid", "activity-city"])
})
