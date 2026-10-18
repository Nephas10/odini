import { test } from "node:test"
import { strict as assert } from "node:assert"
import { filterListings, type ExploreFilters } from "../../lib/explore/filterListings.ts"
import { getDestination, getDestinationOptions, SUPPORTED_DESTINATIONS } from "../../lib/explore/locations.ts"
import { getEventDayBounds, matchesEventDay, normalizeEventSchedule } from "../../lib/explore/eventDates.ts"

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

// Stage 2 deliberately replaces Stage 1's case-sensitive full-location matching.
// The historical assertions remain in checkpoint f038f5b; no test is dropped.
test("location matches a whole recognized destination case-insensitively with whitespace tolerance", () => {
  assert.deepEqual(ids({ location: "Lusaka" }), ["stay-city", "event-free", "event-paid", "activity-city"])
  assert.deepEqual(ids({ location: "Lusa" }), [])
  assert.deepEqual(ids({ location: "lusaka" }), ["stay-city", "event-free", "event-paid", "activity-city"])
  assert.deepEqual(ids({ location: " Lusaka " }), ["stay-city", "event-free", "event-paid", "activity-city"])
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

for (const destination of SUPPORTED_DESTINATIONS) {
  test(`maps exact supported destination ${destination}`, () => {
    assert.equal(getDestination(destination), destination)
  })
}

test("maps neighbourhood plus explicit city without guessing neighbourhood-only values", () => {
  assert.equal(getDestination("Roma, Lusaka"), "Lusaka")
  assert.equal(getDestination("Woodlands, Lusaka"), "Lusaka")
  assert.equal(getDestination("Kabulonga, Lusaka, Zambia"), "Lusaka")
  assert.equal(getDestination("Roma"), null)
  assert.equal(getDestination("Woodlands"), null)
})

test("maps explicit city plus province or country", () => {
  assert.equal(getDestination("Livingstone, Southern Province"), "Livingstone")
  assert.equal(getDestination("Kitwe, Copperbelt"), "Kitwe")
  assert.equal(getDestination("Ndola, Copperbelt, Zambia"), "Ndola")
  assert.equal(getDestination("Kafue, Zambia"), "Kafue")
})

test("normalizes capitalization, outer whitespace and repeated token whitespace", () => {
  assert.equal(getDestination("  rOmA ,  lUsAkA  , Zambia  "), "Lusaka")
  assert.equal(getDestination("  South   LUANGWA , Zambia "), "South Luangwa")
  assert.equal(getDestination("\t livingstone \n"), "Livingstone")
})

test("unknown, missing and blank locations are never silently assigned a city", () => {
  for (const location of [null, "", " \t ", "Remote Camp", "Southern Province", "Zambia", "Unknown City, Zambia"]) {
    assert.equal(getDestination(location), null)
  }
})

test("multiple recognized destinations are ambiguous regardless of order", () => {
  assert.equal(getDestination("Lusaka, Livingstone"), null)
  assert.equal(getDestination("Kitwe, Roma, Lusaka, Zambia"), null)
  assert.equal(getDestination("South Luangwa, Ndola"), null)
  assert.equal(getDestination("Lusaka / Kitwe"), null)
  assert.equal(getDestination("Lusaka, LUSAKA"), "Lusaka")
})

test("embedded city names and prose do not match whole destination tokens", () => {
  for (const location of ["Newlusaka", "Lusakaville", "Lusaka Heights", "Near Lusaka", "Hotel Lusaka, Zambia", "LivingstoneRoad"]) {
    assert.equal(getDestination(location), null)
  }
})

const cityListings = Object.freeze([
  Object.freeze({ id: "stay-roma", listing_type: "stay", title: "Garden Rest", description: null, location: "Roma, Lusaka", price: 100 }),
  Object.freeze({ id: "event-kabulonga", listing_type: "event", title: "Garden Music", description: null, location: "Kabulonga, Lusaka, Zambia", price: 150 }),
  Object.freeze({ id: "activity-woodlands", listing_type: "activity", title: "Garden Walk", description: null, location: "Woodlands, Lusaka", price: 200 }),
  Object.freeze({ id: "stay-livingstone", listing_type: "stay", title: "Garden Rest", description: null, location: "Livingstone, Southern Province", price: 100 }),
  Object.freeze({ id: "event-kitwe", listing_type: "event", title: "Garden Music", description: null, location: "Kitwe, Copperbelt", price: 150 }),
  Object.freeze({ id: "activity-unknown", listing_type: "activity", title: "Garden Walk", description: null, location: "Remote Camp", price: 100 }),
  Object.freeze({ id: "stay-ambiguous", listing_type: "stay", title: "Garden Rest", description: null, location: "Lusaka, Kitwe", price: 100 }),
  Object.freeze({ id: "event-embedded", listing_type: "event", title: "Garden Music", description: null, location: "Newlusaka", price: 150 }),
  Object.freeze({ id: "activity-null", listing_type: "activity", title: "Garden Walk", description: null, location: null, price: 100 }),
])

test("city options are derived, canonical, deduplicated and sorted", () => {
  assert.deepEqual(getDestinationOptions(cityListings), ["Kitwe", "Livingstone", "Lusaka"])
  assert.deepEqual(getDestinationOptions([...cityListings, { location: " lUSaka " }]), ["Kitwe", "Livingstone", "Lusaka"])
  assert.deepEqual(getDestinationOptions([]), [])
  assert.deepEqual(getDestinationOptions([{ location: "Unknown" }, { location: "Lusaka, Kitwe" }]), [])
})

test("Lusaka matches explicitly identified neighbourhoods across all three categories", () => {
  assert.deepEqual(filterListings(cityListings, { ...defaults, location: " luSAka " }).map((listing) => listing.id), ["stay-roma", "event-kabulonga", "activity-woodlands"])
})

test("city filtering combines with existing category, search and inclusive budget bounds", () => {
  assert.deepEqual(filterListings(cityListings, { ...defaults, category: "event", search: " GARDEN ", location: "lusaka", minPrice: "150", maxPrice: "150" }).map((listing) => listing.id), ["event-kabulonga"])
  assert.deepEqual(filterListings(cityListings, { ...defaults, category: "activity", search: "woodlands", location: "Lusaka", maxPrice: "200" }).map((listing) => listing.id), ["activity-woodlands"])
})

test("clearing Where to All retains unknown/ambiguous listings and other active predicates", () => {
  const selected = { ...defaults, category: "event", search: "garden", location: "Lusaka", minPrice: "100", maxPrice: "200" }
  assert.deepEqual(filterListings(cityListings, selected).map((listing) => listing.id), ["event-kabulonga"])
  assert.deepEqual(filterListings(cityListings, { ...selected, location: "all" }).map((listing) => listing.id), ["event-kabulonga", "event-kitwe", "event-embedded"])
  assert.deepEqual(filterListings(cityListings, defaults).map((listing) => listing.id), ["stay-roma", "event-kabulonga", "activity-woodlands", "stay-livingstone", "event-kitwe", "activity-unknown", "stay-ambiguous", "event-embedded", "activity-null"])
})

test("normalization leaves full card location data and record order/identity unchanged", () => {
  const result = filterListings(cityListings, { ...defaults, location: "Lusaka" })
  assert.deepEqual(result.map((listing) => listing.location), ["Roma, Lusaka", "Kabulonga, Lusaka, Zambia", "Woodlands, Lusaka"])
  assert.equal(result[0], cityListings[0])
  assert.equal(result[1], cityListings[1])
  assert.equal(result[2], cityListings[2])
  getDestinationOptions(cityListings)
  assert.equal(cityListings[6].location, "Lusaka, Kitwe")
})

for (const [address, expected] of [
  ["Roma, Lusaka", "Lusaka"],
  ["Kabulonga, Lusaka, Zambia", "Lusaka"],
  ["Woodlands, Lusaka", "Lusaka"],
  ["Chongwe, Lusaka", null],
  ["Chongwe, Lusaka Province", null],
  ["Kafue, Lusaka", "Kafue"],
  ["Kafue, Lusaka Province", "Kafue"],
  ["Lusaka, Kitwe", null],
  ["Roma, Lusaka, Zimbabwe", null],
  ["Kitwe, Lusaka Province", null],
  ["Unknown Settlement, Lusaka", null],
  ["Unknown Settlement, Lusaka Province", null],
  ["Lusaka, Kafue", null],
  ["Roma, Livingstone", null],
  ["Roma, Lusaka Province", null],
  ["Livingstone, Copperbelt", null],
  ["Ndola, Southern Province", null],
  ["Kitwe, Copperbelt, Zimbabwe", null],
  ["Kitwe, Copperbelt, Zambia", "Kitwe"],
  ["Lusaka, Lusaka Province, Zambia", "Lusaka"],
  [" KAFUE , lUsAkA , Zambia ", "Kafue"],
  ["South Luangwa, Eastern Province", null],
] as const) {
  test(`geographic context for ${address} resolves to ${expected ?? "unknown"}`, () => {
    assert.equal(getDestination(address), expected)
  })
}

test("preserves the explicit six-destination rollout list", () => {
  assert.deepEqual(SUPPORTED_DESTINATIONS, ["Lusaka", "Livingstone", "Kitwe", "Ndola", "Kafue", "South Luangwa"])
})

const geographicListings = Object.freeze([
  Object.freeze({ id: "stay-roma-valid", listing_type: "stay", title: "Garden Stay", description: null, location: "Roma, Lusaka", price: 150 }),
  Object.freeze({ id: "event-chongwe-bare", listing_type: "event", title: "Garden Music", description: null, location: "Chongwe, Lusaka", price: 150 }),
  Object.freeze({ id: "activity-chongwe-province", listing_type: "activity", title: "Garden Walk", description: null, location: "Chongwe, Lusaka Province", price: 150 }),
  Object.freeze({ id: "stay-kafue-bare", listing_type: "stay", title: "Garden Stay", description: null, location: "Kafue, Lusaka", price: 150 }),
  Object.freeze({ id: "event-kafue-province", listing_type: "event", title: "Garden Music", description: null, location: "Kafue, Lusaka Province", price: 150 }),
  Object.freeze({ id: "activity-city-conflict", listing_type: "activity", title: "Garden Walk", description: null, location: "Lusaka, Kitwe", price: 150 }),
  Object.freeze({ id: "stay-country-conflict", listing_type: "stay", title: "Garden Stay", description: null, location: "Roma, Lusaka, Zimbabwe", price: 150 }),
  Object.freeze({ id: "event-province-conflict", listing_type: "event", title: "Garden Music", description: null, location: "Kitwe, Lusaka Province", price: 150 }),
  Object.freeze({ id: "activity-unknown-prefix", listing_type: "activity", title: "Garden Walk", description: null, location: "Unknown Settlement, Lusaka", price: 150 }),
])

test("ambiguous addresses cannot match an incorrect city, even with other filters active", () => {
  const filters = { ...defaults, search: "garden", minPrice: "150", maxPrice: "150" }
  assert.deepEqual(filterListings(geographicListings, { ...filters, location: "Lusaka" }).map((listing) => listing.id), ["stay-roma-valid"])
  assert.deepEqual(filterListings(geographicListings, { ...filters, location: "Kafue" }).map((listing) => listing.id), ["stay-kafue-bare", "event-kafue-province"])
  assert.deepEqual(filterListings(geographicListings, { ...filters, location: "Kitwe" }).map((listing) => listing.id), [])
})

test("unknown/conflicting addresses do not create city options", () => {
  assert.deepEqual(getDestinationOptions(geographicListings), ["Kafue", "Lusaka"])
  const unresolved = geographicListings.filter((listing) => !["stay-roma-valid", "stay-kafue-bare", "event-kafue-province"].includes(listing.id))
  assert.deepEqual(getDestinationOptions(unresolved), [])
})

test("All locations and original-text search retain conflicting geography without address mutation", () => {
  assert.deepEqual(filterListings(geographicListings, defaults).map((listing) => listing.id), ["stay-roma-valid", "event-chongwe-bare", "activity-chongwe-province", "stay-kafue-bare", "event-kafue-province", "activity-city-conflict", "stay-country-conflict", "event-province-conflict", "activity-unknown-prefix"])
  assert.deepEqual(filterListings(geographicListings, { ...defaults, search: "chongwe" }).map((listing) => listing.id), ["event-chongwe-bare", "activity-chongwe-province"])
  assert.deepEqual(filterListings(geographicListings, { ...defaults, search: "zimbabwe", category: "stay", minPrice: "150", maxPrice: "150" }).map((listing) => listing.id), ["stay-country-conflict"])
  assert.equal(filterListings(geographicListings, { ...defaults, search: "zimbabwe" })[0], geographicListings[6])
  getDestinationOptions(geographicListings)
  assert.equal(geographicListings[6].location, "Roma, Lusaka, Zimbabwe")
})

test("Lusaka calendar day has explicit UTC boundaries independent of browser timezone", () => {
  const bounds = getEventDayBounds("2026-10-13")!
  assert.equal(new Date(bounds.start).toISOString(), "2026-10-12T22:00:00.000Z")
  assert.equal(new Date(bounds.end).toISOString(), "2026-10-13T22:00:00.000Z")
})

test("leap day and year boundaries produce the next local midnight", () => {
  const leap = getEventDayBounds("2024-02-29")!
  assert.equal(new Date(leap.start).toISOString(), "2024-02-28T22:00:00.000Z")
  assert.equal(new Date(leap.end).toISOString(), "2024-02-29T22:00:00.000Z")
  assert.equal(new Date(getEventDayBounds("2026-12-31")!.end).toISOString(), "2026-12-31T22:00:00.000Z")
})

for (const date of ["2026-02-29", "2024-02-30", "2026-13-01", "2026-00-01", "2026-10-00", "2026-10-32", "0000-01-01", "2026-1-1", "bad", " 2026-10-13 "]) {
  test(`rejects invalid selected calendar date ${date}`, () => {
    assert.equal(getEventDayBounds(date), null)
  })
}

for (const [name, start, end, expected] of [
  ["before Lusaka midnight", "2026-10-12T21:59:59Z", null, false],
  ["at Lusaka midnight", "2026-10-12T22:00:00Z", null, true],
  ["last millisecond of day", "2026-10-13T21:59:59.999Z", null, true],
  ["next midnight", "2026-10-13T22:00:00Z", null, false],
  ["explicit local offset", "2026-10-13T00:00:00+02:00", null, true],
  ["negative offset crosses local day", "2026-10-12T20:00:00-03:00", null, true],
  ["multi-day overlap", "2026-10-10T10:00:00Z", "2026-10-15T10:00:00Z", true],
  ["overnight overlap", "2026-10-12T21:00:00Z", "2026-10-12T23:00:00Z", true],
  ["exclusive end at day start", "2026-10-12T10:00:00Z", "2026-10-12T22:00:00Z", false],
  ["end one microsecond after day start", "2026-10-12T10:00:00Z", "2026-10-12T22:00:00.000001Z", true],
  ["start one microsecond before next midnight", "2026-10-13T21:59:59.999999Z", null, true],
  ["end at next midnight", "2026-10-13T10:00:00Z", "2026-10-13T22:00:00Z", true],
  ["equal start and end", "2026-10-13T10:00:00Z", "2026-10-13T10:00:00Z", true],
  ["equal endpoints outside day", "2026-10-12T10:00:00Z", "2026-10-12T10:00:00Z", false],
  ["end before start", "2026-10-13T10:00:00Z", "2026-10-13T09:00:00Z", false],
  ["invalid end", "2026-10-13T10:00:00Z", "bad", false],
  ["empty explicit end", "2026-10-13T10:00:00Z", "", false],
  ["numeric end", "2026-10-13T10:00:00Z", 0, false],
  ["missing start", null, null, false],
  ["malformed start", "bad", null, false],
  ["timezone-free start", "2026-10-13T10:00:00", null, false],
  ["rolled calendar start", "2026-02-30T10:00:00Z", null, false],
  ["rolled calendar end", "2026-10-13T10:00:00Z", "2026-11-31T10:00:00Z", false],
  ["invalid hour", "2026-10-13T24:00:00Z", null, false],
  ["invalid offset", "2026-10-13T10:00:00+02:60", null, false],
  ["microsecond database timestamp", "2026-10-13T10:00:00.123456+00:00", null, true],
] as const) {
  test(`event day matching: ${name}`, () => {
    assert.equal(matchesEventDay({ event_time: start, end_time: end }, getEventDayBounds("2026-10-13")), expected)
  })
}

test("valid leap-day event matches but an impossible leap-day start does not", () => {
  assert.equal(matchesEventDay({ event_time: "2024-02-29T00:00:00+02:00", end_time: null }, getEventDayBounds("2024-02-29")), true)
  assert.equal(matchesEventDay({ event_time: "2026-02-29T00:00:00+02:00", end_time: null }, getEventDayBounds("2026-03-01")), false)
})

test("to-one schedule adapter preserves fields without guessing array cardinality", () => {
  const raw = Object.freeze({ event_time: "2026-10-13T10:00:00Z", end_time: null })
  assert.deepEqual(normalizeEventSchedule(raw), { event_time: "2026-10-13T10:00:00Z", end_time: null })
  for (const value of [null, undefined, [], [raw], [raw, raw], "bad", 12]) {
    assert.equal(normalizeEventSchedule(value), null)
  }
  assert.equal(matchesEventDay(normalizeEventSchedule({}), getEventDayBounds("2026-10-13")), false)
  assert.equal(matchesEventDay(normalizeEventSchedule({ event_time: raw.event_time, end_time: {} }), getEventDayBounds("2026-10-13")), false)
})

const datedListings = Object.freeze([
  Object.freeze({ id: "stay-no-date", listing_type: "stay", title: "Garden Stay", description: null, location: "Roma, Lusaka", price: 100 }),
  Object.freeze({ id: "event-match", listing_type: "event", title: "Garden Music", description: null, location: "Kabulonga, Lusaka, Zambia", price: 100, available_slots: 0, capacity: 0, eventSchedule: Object.freeze({ event_time: "2026-10-13T10:00:00Z", end_time: null }) }),
  Object.freeze({ id: "activity-no-date", listing_type: "activity", title: "Garden Walk", description: null, location: "Woodlands, Lusaka", price: 100 }),
  Object.freeze({ id: "event-other-day", listing_type: "event", title: "Garden Music", description: null, location: "Lusaka", price: 100, eventSchedule: Object.freeze({ event_time: "2026-10-14T10:00:00Z", end_time: null }) }),
  Object.freeze({ id: "event-undated", listing_type: "event", title: "Garden Music", description: null, location: "Lusaka", price: 100 }),
  Object.freeze({ id: "event-wrong-city", listing_type: "event", title: "Garden Music", description: null, location: "Kitwe", price: 100, eventSchedule: Object.freeze({ event_time: "2026-10-13T10:00:00Z", end_time: null }) }),
  Object.freeze({ id: "event-wrong-price", listing_type: "event", title: "Garden Music", description: null, location: "Lusaka", price: 101, eventSchedule: Object.freeze({ event_time: "2026-10-13T10:00:00Z", end_time: null }) }),
  Object.freeze({ id: "event-wrong-search", listing_type: "event", title: "Concert", description: null, location: "Lusaka", price: 100, eventSchedule: Object.freeze({ event_time: "2026-10-13T10:00:00Z", end_time: null }) }),
])

test("date filters only Events and preserves mixed-category ordering and identities", () => {
  const result = filterListings(datedListings, { ...defaults, date: "2026-10-13" })
  assert.deepEqual(result.map((listing) => listing.id), ["stay-no-date", "event-match", "activity-no-date", "event-wrong-city", "event-wrong-price", "event-wrong-search"])
  assert.equal(result[1], datedListings[1])
  assert.equal(result[1].location, "Kabulonga, Lusaka, Zambia")
  assert.deepEqual(result[1].eventSchedule, { event_time: "2026-10-13T10:00:00Z", end_time: null })
})

for (const [category, expected] of [
  ["stay", ["stay-no-date"]], ["activity", ["activity-no-date"]],
  ["event", ["event-match", "event-wrong-city", "event-wrong-price", "event-wrong-search"]],
] as const) {
  test(`active date preserves ${category} category semantics`, () => {
    assert.deepEqual(filterListings(datedListings, { ...defaults, category, date: "2026-10-13" }).map((listing) => listing.id), expected)
  })
}

test("date combines independently with category, text, city and inclusive budget", () => {
  const filters = { ...defaults, date: "2026-10-13", category: "event", search: " GARDEN ", location: " lusaka ", minPrice: "100", maxPrice: "100" }
  assert.deepEqual(filterListings(datedListings, filters).map((listing) => listing.id), ["event-match"])
  assert.deepEqual(filterListings(datedListings, { ...filters, date: "" }).map((listing) => listing.id), ["event-match", "event-other-day", "event-undated"])
})

test("invalid selected day excludes Events while retaining non-Events", () => {
  assert.deepEqual(filterListings(datedListings, { ...defaults, date: "2026-02-30" }).map((listing) => listing.id), ["stay-no-date", "activity-no-date"])
})

test("restoring default state including date restores all results, not UI button coverage", () => {
  const changed = { ...defaults, category: "event", search: "garden", location: "Lusaka", minPrice: "100", maxPrice: "100", date: "2026-10-13" }
  assert.deepEqual(filterListings(datedListings, changed).map((listing) => listing.id), ["event-match"])
  const reset = { ...changed, ...defaults, date: "" }
  assert.deepEqual(filterListings(datedListings, reset).map((listing) => listing.id), ["stay-no-date", "event-match", "activity-no-date", "event-other-day", "event-undated", "event-wrong-city", "event-wrong-price", "event-wrong-search"])
})

test("missing and malformed schedules stay visible without an active date", () => {
  const records = [
    { ...datedListings[1], id: "null-relation", eventSchedule: null },
    { ...datedListings[1], id: "invalid-start", eventSchedule: { event_time: "bad", end_time: null } },
    { ...datedListings[1], id: "invalid-end", eventSchedule: { event_time: "2026-10-13T10:00:00Z", end_time: "bad" } },
    { ...datedListings[1], id: "free-valid", price: 0 },
    { ...datedListings[1], id: "null-price-valid", price: null },
  ]
  assert.deepEqual(filterListings(records, defaults).map((listing) => listing.id), ["null-relation", "invalid-start", "invalid-end", "free-valid", "null-price-valid"])
  assert.deepEqual(filterListings(records, { ...defaults, date: "2026-10-13" }).map((listing) => listing.id), ["free-valid", "null-price-valid"])
  assert.deepEqual(filterListings(records, { ...defaults, date: "2026-10-13", minPrice: "0", maxPrice: "0" }).map((listing) => listing.id), ["free-valid"])
})

// Independent precision regressions: every expected result is explicit.
for (const year of ["2026", "2256", "9999"]) {
  for (const [name, start, end, expected] of [
    ["one microsecond before midnight", `${year}-10-12T21:59:59.999999Z`, null, false],
    ["exactly midnight", `${year}-10-12T22:00:00.000000Z`, null, true],
    ["one microsecond after midnight", `${year}-10-12T22:00:00.000001Z`, null, true],
    ["exclusive end exactly midnight", `${year}-10-12T20:00:00Z`, `${year}-10-12T22:00:00.000000Z`, false],
    ["exclusive end one microsecond before midnight", `${year}-10-12T20:00:00Z`, `${year}-10-12T21:59:59.999999Z`, false],
    ["exclusive end one microsecond after midnight", `${year}-10-12T20:00:00Z`, `${year}-10-12T22:00:00.000001Z`, true],
    ["equal endpoints before midnight", `${year}-10-12T21:59:59.999999Z`, `${year}-10-12T21:59:59.999999Z`, false],
    ["equal endpoints at midnight", `${year}-10-12T22:00:00.000000Z`, `${year}-10-12T22:00:00.000000Z`, true],
    ["reversed one-microsecond interval", `${year}-10-12T22:00:00.000002Z`, `${year}-10-12T22:00:00.000001Z`, false],
    ["positive offset before midnight", `${year}-10-12T23:59:59.999999+02:00`, null, false],
    ["negative offset before midnight", `${year}-10-12T18:59:59.999999-03:00`, null, false],
    ["negative offset at midnight", `${year}-10-12T19:00:00.000000-03:00`, null, true],
    ["missing end at midnight", `${year}-10-12T22:00:00Z`, undefined, true],
    ["missing end before midnight", `${year}-10-12T21:59:59.999999Z`, undefined, false],
  ] as const) {
    test(`exact precision ${year}: ${name}`, () => {
      assert.equal(matchesEventDay({ event_time: start, end_time: end }, getEventDayBounds(`${year}-10-13`)), expected)
    })
  }
}

test("exact microseconds on distant leap day preserve the exclusive next midnight", () => {
  const bounds = getEventDayBounds("2400-02-29")
  assert.equal(matchesEventDay({ event_time: "2400-02-28T23:59:59.999999+02:00", end_time: null }, bounds), false)
  assert.equal(matchesEventDay({ event_time: "2400-02-29T00:00:00+02:00", end_time: null }, bounds), true)
  assert.equal(matchesEventDay({ event_time: "2400-02-29T23:59:59.999999+02:00", end_time: null }, bounds), true)
  assert.equal(matchesEventDay({ event_time: "2400-03-01T00:00:00+02:00", end_time: null }, bounds), false)
})

test("pre-epoch fractions retain exact ordering when epoch milliseconds are negative", () => {
  const bounds = getEventDayBounds("1969-10-13")
  assert.equal(matchesEventDay({ event_time: "1969-10-12T21:59:59.999999Z", end_time: null }, bounds), false)
  assert.equal(matchesEventDay({ event_time: "1969-10-12T22:00:00.000001Z", end_time: null }, bounds), true)
  assert.equal(matchesEventDay({ event_time: "1969-10-12T22:00:00.000002Z", end_time: "1969-10-12T22:00:00.000001Z" }, bounds), false)
})
