// Initial rollout destinations. Match whole comma-separated tokens only.
export const SUPPORTED_DESTINATIONS = [
  "Lusaka", "Livingstone", "Kitwe", "Ndola", "Kafue", "South Luangwa",
] as const

export type Destination = (typeof SUPPORTED_DESTINATIONS)[number]

// Only these reviewed neighbourhoods may precede an explicit Lusaka city token.
const LUSAKA_NEIGHBOURHOODS = ["roma", "kabulonga", "woodlands"] as const

// Accepted administrative context, not alternative destination choices.
// Bare Lusaka is a province alias only AFTER an explicit Kafue locality.
const PROVINCE_CONTEXT: Record<Destination, readonly string[]> = {
  Lusaka: ["lusaka province"],
  Livingstone: ["southern", "southern province"],
  Kitwe: ["copperbelt", "copperbelt province"],
  Ndola: ["copperbelt", "copperbelt province"],
  Kafue: ["lusaka", "lusaka province"],
  "South Luangwa": [], // No province association inferred for this destination.
}

function normalizeToken(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase()
}

export function getDestination(location: string | null): Destination | null {
  if (!location) return null

  const tokens = location.split(",").map(normalizeToken).filter(Boolean)
  let localityIndex = 0
  if (LUSAKA_NEIGHBOURHOODS.some((neighbourhood) => neighbourhood === tokens[0])) {
    if (tokens[1] !== "lusaka") return null
    localityIndex = 1
  }

  // Locality must be explicit and first (after an approved neighbourhood).
  // Chongwe and unfamiliar prefixes must not become Lusaka via province text.
  const destination = SUPPORTED_DESTINATIONS.find((candidate) =>
    normalizeToken(candidate) === tokens[localityIndex]
  )
  if (!destination) return null

  const allowedContext = [normalizeToken(destination), "zambia", ...PROVINCE_CONTEXT[destination]]
  return tokens.slice(localityIndex + 1).every((token) => allowedContext.includes(token))
    ? destination
    : null
}

export function matchesDestination(location: string | null, selected: string): boolean {
  const destination = getDestination(location)
  return destination !== null && normalizeToken(destination) === normalizeToken(selected)
}

export function getDestinationOptions(
  listings: readonly { location: string | null }[]
): Destination[] {
  return Array.from(new Set(
    listings.map((listing) => getDestination(listing.location))
      .filter((destination): destination is Destination => destination !== null)
  )).sort()
}
