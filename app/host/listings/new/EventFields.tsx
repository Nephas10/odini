type Props = {
  eventType: string
  setEventType: (value: string) => void
  eventTime: string
  setEventTime: (value: string) => void
  endTime: string
  setEndTime: (value: string) => void
  capacity: string
  setCapacity: (value: string) => void
  availableSlots: string
  setAvailableSlots: (value: string) => void
}

export default function EventFields({
  eventType,
  setEventType,
  eventTime,
  setEventTime,
  endTime,
  setEndTime,
  capacity,
  setCapacity,
  availableSlots,
  setAvailableSlots,
}: Props) {
  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Event Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Provide information about the event.
        </p>
      </div>

      <div className="mt-5 space-y-5">

        {/* Event Type */}
        <div>
          <label
            htmlFor="eventType"
            className="text-sm font-semibold text-gray-900"
          >
            Event Type
          </label>

          <input
            id="eventType"
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="e.g. Concert, Conference, Workshop"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Event Time */}
        <div>
          <label
            htmlFor="eventTime"
            className="text-sm font-semibold text-gray-900"
          >
            Event Date & Time
          </label>

          <input
            id="eventTime"
            type="datetime-local"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* End Time */}
        <div>
          <label
            htmlFor="endTime"
            className="text-sm font-semibold text-gray-900"
          >
            End Date & Time
          </label>

          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="text-sm font-semibold text-gray-900"
          >
            Capacity
          </label>

          <input
            id="capacity"
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 100"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Available Slots */}
        <div>
          <label
            htmlFor="availableSlots"
            className="text-sm font-semibold text-gray-900"
          >
            Available Slots
          </label>

          <input
            id="availableSlots"
            type="number"
            min="0"
            value={availableSlots}
            onChange={(e) => setAvailableSlots(e.target.value)}
            placeholder="e.g. 100"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

      </div>
    </div>
  )
}