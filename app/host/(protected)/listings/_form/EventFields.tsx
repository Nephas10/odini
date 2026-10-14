import type { EventRow } from "./fields"
import { Input, Section } from "./ui"

type Props = {
  defaults?: Partial<EventRow>
  errors?: Record<string, string>
  // On edit: how many tickets are already booked, so capacity can't go below it
  ticketsSold?: number
}

const EVENT_TYPES = ["Concert", "Festival", "Party", "Comedy show", "Conference", "Sports", "Exhibition", "Workshop"]
const AGE_OPTIONS = ["All ages", "12+", "16+", "18+", "21+"]

// A saved timestamp -> "2026-10-16T18:00" for the date-time picker, in Zambian time
function toPickerValue(iso?: string | null) {
  if (!iso) return ""
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lusaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`
}

// The extra fields for an event. Used by both create and edit.
export default function EventFields({ defaults = {}, errors, ticketsSold = 0 }: Props) {
  return (
    <>
      <Section title="Event details" description="What it is and where it happens.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="event_type"
            label="Type of event"
            list="event-type-options"
            placeholder="e.g. Concert"
            defaultValue={defaults.event_type ?? ""}
            errors={errors}
          />
          <Input
            name="venue_name"
            label="Venue"
            placeholder="e.g. Showgrounds Amphitheatre"
            defaultValue={defaults.venue_name ?? ""}
            errors={errors}
          />
        </div>
        {/* Suggestions; hosts can still type their own */}
        <datalist id="event-type-options">
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </Section>

      <Section title="Date and time" description="Times are in Zambian time.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="event_time"
            label="Starts"
            type="datetime-local"
            required
            defaultValue={toPickerValue(defaults.event_time)}
            errors={errors}
          />
          <Input
            name="end_time"
            label="Ends"
            type="datetime-local"
            defaultValue={toPickerValue(defaults.end_time)}
            errors={errors}
          />
        </div>
      </Section>

      <Section title="Tickets and entry">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="capacity"
            label="Number of tickets"
            type="number"
            min={Math.max(1, ticketsSold)}
            max={100000}
            inputMode="numeric"
            required
            hint={
              ticketsSold > 0
                ? `${ticketsSold} already booked, so it can't go below that.`
                : "The total number of people who can attend."
            }
            defaultValue={defaults.capacity ?? ""}
            errors={errors}
          />
          <Input
            name="age_restriction"
            label="Age restriction"
            list="age-options"
            placeholder="e.g. 18+"
            defaultValue={defaults.age_restriction ?? ""}
            errors={errors}
          />
        </div>
        <datalist id="age-options">
          {AGE_OPTIONS.map((a) => (
            <option key={a} value={a} />
          ))}
        </datalist>
      </Section>
    </>
  )
}