export type EventSchedule = { event_time: unknown; end_time: unknown }

// The supplied PK/FK contract is to-one. Unexpected arrays are not guessed at.
export function normalizeEventSchedule(value: unknown): EventSchedule | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  return { event_time: record.event_time, end_time: record.end_time }
}

const DAY = 86_400_000
const MICROSECONDS_PER_MILLISECOND = BigInt(1000)
const lusakaClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lusaka", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
})

function calendarMidnight(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith("0000")) return null
  const instant = Date.parse(`${date}T00:00:00Z`)
  return Number.isFinite(instant) && new Date(instant).toISOString().slice(0, 10) === date
    ? instant : null
}

function lusakaMidnight(utcMidnight: number): number {
  const parts = Object.fromEntries(lusakaClock.formatToParts(utcMidnight)
    .map(({ type, value }) => [type, value]))
  const localAsUTC = new Date(0)
  localAsUTC.setUTCFullYear(Number(parts.year), Number(parts.month) - 1, Number(parts.day))
  localAsUTC.setUTCHours(Number(parts.hour), Number(parts.minute), Number(parts.second), 0)
  return utcMidnight - (localAsUTC.getTime() - utcMidnight)
}

export function getEventDayBounds(date: string): { start: number; end: number } | null {
  const midnight = calendarMidnight(date)
  return midnight === null ? null : {
    start: lusakaMidnight(midnight), end: lusakaMidnight(midnight + DAY),
  }
}

// Accept timezone-bearing ISO timestamps, validating calendar/time components
// before Date.parse can roll an impossible date into the following month.
function timestamp(value: unknown): bigint | null {
  if (typeof value !== "string") return null
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|[+-](\d{2}):(\d{2}))$/.exec(value)
  if (!match || calendarMidnight(match[1]) === null || Number(match[2]) > 23 ||
    Number(match[3]) > 59 || Number(match[4]) > 59 ||
    (match[6] !== undefined && (Number(match[6]) > 23 || Number(match[7]) > 59))) return null
  const instant = Date.parse(value.replace(" ", "T"))
  // Date.parse returns exact integer milliseconds throughout the accepted
  // four-digit year range. Restore the remaining digits using integer arithmetic.
  const fraction = /\.(\d+)/.exec(value)?.[1] ?? ""
  const submillisecond = BigInt(fraction.padEnd(6, "0").slice(3))
  return Number.isFinite(instant)
    ? BigInt(instant) * MICROSECONDS_PER_MILLISECOND + submillisecond : null
}

export function matchesEventDay(
  schedule: EventSchedule | null | undefined,
  bounds: { start: number; end: number } | null,
): boolean {
  if (!schedule || !bounds) return false
  const dayStart = BigInt(bounds.start) * MICROSECONDS_PER_MILLISECOND
  const dayEnd = BigInt(bounds.end) * MICROSECONDS_PER_MILLISECOND
  const start = timestamp(schedule.event_time)
  if (start === null) return false
  if (schedule.end_time === null || schedule.end_time === undefined) {
    return start >= dayStart && start < dayEnd
  }
  const end = timestamp(schedule.end_time)
  if (end === null || end < start) return false
  return end === start ? start >= dayStart && start < dayEnd
    : start < dayEnd && end > dayStart
}
