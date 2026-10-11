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
    <div className="space-y-6 border-t border-gray-100 pt-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Event Details
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update the details of your event.
        </p>
      </div>

      {/* Event Type */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Event Type
        </label>

        <input
          type="text"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          placeholder="e.g. Concert, Wedding, Workshop"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* Event Date & Time */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Event Date & Time
        </label>

        <input
          type="datetime-local"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* End Date & Time */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          End Date & Time
        </label>

        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* Capacity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Capacity
        </label>

        <input
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* Available Slots */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Available Slots
        </label>

        <input
          type="number"
          min="0"
          value={availableSlots}
          onChange={(e) => setAvailableSlots(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>
    </div>
  )
}