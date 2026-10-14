// What a listing needs, and how the form input is checked.
// Shared by "create listing" and "edit listing". No database, no UI.
// (The "_form" folder starts with an underscore, so Next.js never turns it into a page.)

export type ListingType = "stay" | "event" | "activity"

export const LISTING_TYPES: { value: ListingType; label: string; hint: string }[] = [
  { value: "stay", label: "Stay", hint: "A lodge, guesthouse, room or apartment" },
  { value: "event", label: "Event", hint: "A concert, festival, party or show on a set date" },
  { value: "activity", label: "Activity", hint: "A tour, class or adventure guests book for a day" },
]

export const AMENITIES = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "parking", label: "Parking" },
  { value: "pool", label: "Swimming pool" },
  { value: "aircon", label: "Air conditioning" },
  { value: "breakfast", label: "Breakfast included" },
  { value: "kitchen", label: "Kitchen" },
  { value: "tv", label: "TV" },
  { value: "hot_water", label: "Hot water" },
  { value: "backup_power", label: "Backup power / solar" },
  { value: "security", label: "24-hour security" },
]

export const DAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
]

export const DEFAULT_CANCELLATION_TERMS =
  "Cancellations and refunds are arranged directly with the host. Please message us on WhatsApp as early as possible if your plans change."

// ---------- What the form produces ----------

export type ListingRow = {
  listing_type: ListingType
  title: string
  description: string | null
  location: string
  price: number
  // All photo addresses, in order; the first is the cover
  photos: string[]
  // The cover photo again, so pages that only read image_url keep working
  image_url: string | null
  cancellation_terms: string
  accessibility_info: string | null
  is_active: boolean
}

export type StayRow = {
  max_guests: number
  available_rooms: number | null
  duration_nights: number | null
  bedrooms: number | null
  bathrooms: number | null
  check_in_time: string | null
  check_out_time: string | null
  amenities: string[]
  house_rules: string | null
  extra_charges: string | null
}

export type EventRow = {
  event_type: string | null
  venue_name: string | null
  event_time: string
  end_time: string | null
  capacity: number
  age_restriction: string | null
}

export type ActivityRow = {
  activity_category: string | null
  duration_minutes: number | null
  max_participants: number | null
  meeting_point: string
  available_days: string[]
  start_times: string[]
  min_age: number | null
  what_to_bring: string | null
  safety_info: string | null
}

export type ParsedListing =
  | { ok: true; listing: ListingRow; details: StayRow | EventRow | ActivityRow }
  | { ok: false; errors: Record<string, string> }

// ---------- Small helpers ----------

function text(form: FormData, name: string, max = 3000): string | null {
  const value = String(form.get(name) ?? "").trim()
  return value ? value.slice(0, max) : null
}

// Whole number, or null if empty. Records an error if it's not a valid number in range.
function int(
  form: FormData,
  name: string,
  errors: Record<string, string>,
  { min = 0, max = 1_000_000, label = "This" } = {}
): number | null {
  const raw = String(form.get(name) ?? "").trim()
  if (!raw) return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < min || n > max) {
    errors[name] = `${label} must be a whole number between ${min} and ${max.toLocaleString()}.`
    return null
  }
  return n
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/

function time(form: FormData, name: string, errors: Record<string, string>): string | null {
  const value = text(form, name, 5)
  if (value && !TIME.test(value)) {
    errors[name] = "Use a time like 14:00."
    return null
  }
  return value
}

// "2026-10-16T18:00" from a date-time picker, read as Zambian time
function lusakaDateTime(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  return `${value}:00+02:00`
}

// Photos must come from this project's own Supabase Storage (not any website)
const MAX_PHOTOS = 8
const STORAGE_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/`

function photos(form: FormData): string[] {
  const urls = form
    .getAll("photos")
    .map((v) => String(v).trim())
    .filter((url) => STORAGE_PREFIX.length > 30 && url.startsWith(STORAGE_PREFIX))
  return Array.from(new Set(urls)).slice(0, MAX_PHOTOS)
}

// ---------- The main check ----------

export function parseListingForm(form: FormData): ParsedListing {
  const errors: Record<string, string> = {}

  const type = String(form.get("listing_type") ?? "") as ListingType
  if (!LISTING_TYPES.some((t) => t.value === type)) {
    return { ok: false, errors: { listing_type: "Please choose what you're listing." } }
  }

  // Shared fields
  const title = text(form, "title", 100)
  const location = text(form, "location", 120)
  const price = int(form, "price", errors, { min: 0, max: 1_000_000, label: "Price" })
  const cancellationTerms = text(form, "cancellation_terms", 1000)

  if (!title) errors.title = "Please give your listing a title."
  if (!location) errors.location = "Please add a location, e.g. Lusaka or Livingstone."
  if (price === null && !errors.price) errors.price = "Please set a price in kwacha."
  if (!cancellationTerms) errors.cancellation_terms = "Guests must see your cancellation terms before booking."

  const photoList = photos(form)
  const publishing = form.get("intent") === "publish"
  // Drafts can be saved without photos; published listings need at least one
  if (publishing && photoList.length === 0) errors.photos = "Add at least one photo before publishing."

  const listing: ListingRow = {
    listing_type: type,
    title: title ?? "",
    description: text(form, "description"),
    location: location ?? "",
    price: price ?? 0,
    photos: photoList,
    image_url: photoList[0] ?? null,
    cancellation_terms: cancellationTerms ?? "",
    accessibility_info: text(form, "accessibility_info", 1000),
    // Which button they pressed: "Publish" or "Save as draft"
    is_active: publishing,
  }

  // Type-specific fields
  let details: StayRow | EventRow | ActivityRow

  if (type === "stay") {
    const maxGuests = int(form, "max_guests", errors, { min: 1, max: 100, label: "Guests" })
    if (maxGuests === null && !errors.max_guests) errors.max_guests = "How many guests can stay?"

    const checkIn = time(form, "check_in_time", errors)
    const checkOut = time(form, "check_out_time", errors)

    details = {
      max_guests: maxGuests ?? 1,
      available_rooms: int(form, "available_rooms", errors, { min: 0, max: 500, label: "Rooms" }),
      duration_nights: int(form, "duration_nights", errors, { min: 1, max: 60, label: "Minimum nights" }),
      bedrooms: int(form, "bedrooms", errors, { min: 0, max: 100, label: "Bedrooms" }),
      bathrooms: int(form, "bathrooms", errors, { min: 0, max: 100, label: "Bathrooms" }),
      check_in_time: checkIn,
      check_out_time: checkOut,
      amenities: form
        .getAll("amenities")
        .map(String)
        .filter((a) => AMENITIES.some((x) => x.value === a)),
      house_rules: text(form, "house_rules", 2000),
      extra_charges: text(form, "extra_charges", 1000),
    }
  } else if (type === "event") {
    const start = lusakaDateTime(text(form, "event_time", 16))
    const end = lusakaDateTime(text(form, "end_time", 16))
    const capacity = int(form, "capacity", errors, { min: 1, max: 100_000, label: "Capacity" })

    if (!start) errors.event_time = "When does the event start?"
    else if (new Date(start).getTime() < Date.now()) errors.event_time = "The start time is in the past."
    if (end && start && new Date(end) <= new Date(start)) errors.end_time = "The end time must be after the start."
    if (capacity === null && !errors.capacity) errors.capacity = "How many tickets are available?"

    details = {
      event_type: text(form, "event_type", 60),
      venue_name: text(form, "venue_name", 120),
      event_time: start ?? "",
      end_time: end,
      capacity: capacity ?? 1,
      age_restriction: text(form, "age_restriction", 60),
    }
  } else {
    const meetingPoint = text(form, "meeting_point", 300)
    if (!meetingPoint) errors.meeting_point = "Where should guests meet you?"

    // "08:00, 14:30" -> ["08:00", "14:30"]
    const startTimes = (text(form, "start_times", 200) ?? "")
      .split(/[,\s]+/)
      .filter(Boolean)
    const badTime = startTimes.find((t) => !TIME.test(t))
    if (badTime) errors.start_times = `"${badTime}" isn't a time. Use times like 08:00, 14:30.`

    details = {
      activity_category: text(form, "activity_category", 60),
      duration_minutes: int(form, "duration_minutes", errors, { min: 1, max: 10_080, label: "Duration" }),
      max_participants: int(form, "max_participants", errors, { min: 1, max: 1000, label: "Group size" }),
      meeting_point: meetingPoint ?? "",
      available_days: form
        .getAll("available_days")
        .map(String)
        .filter((d) => DAYS.some((x) => x.value === d)),
      start_times: badTime ? [] : Array.from(new Set(startTimes)).sort(),
      min_age: int(form, "min_age", errors, { min: 0, max: 99, label: "Minimum age" }),
      what_to_bring: text(form, "what_to_bring", 1000),
      safety_info: text(form, "safety_info", 1000),
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, listing, details }
}