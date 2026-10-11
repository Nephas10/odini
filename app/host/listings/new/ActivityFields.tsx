type Props = {
  activityCategory: string
  setActivityCategory: (value: string) => void
  durationMinutes: string
  setDurationMinutes: (value: string) => void
  maxParticipants: string
  setMaxParticipants: (value: string) => void
  meetingPoint: string
  setMeetingPoint: (value: string) => void
}

export default function ActivityFields({
  activityCategory,
  setActivityCategory,
  durationMinutes,
  setDurationMinutes,
  maxParticipants,
  setMaxParticipants,
  meetingPoint,
  setMeetingPoint,
}: Props) {
  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Activity Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Provide information about the activity.
        </p>
      </div>

      <div className="mt-5 space-y-5">

        {/* Category */}
        <div>
          <label
            htmlFor="activityCategory"
            className="text-sm font-semibold text-gray-900"
          >
            Activity Category
          </label>

          <input
            id="activityCategory"
            type="text"
            value={activityCategory}
            onChange={(e) => setActivityCategory(e.target.value)}
            placeholder="e.g. Adventure, Fitness, Tourism"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Duration */}
        <div>
          <label
            htmlFor="durationMinutes"
            className="text-sm font-semibold text-gray-900"
          >
            Duration (minutes)
          </label>

          <input
            id="durationMinutes"
            type="number"
            min="1"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 120"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Participants */}
        <div>
          <label
            htmlFor="maxParticipants"
            className="text-sm font-semibold text-gray-900"
          >
            Maximum Participants
          </label>

          <input
            id="maxParticipants"
            type="number"
            min="1"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            placeholder="e.g. 10"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

        {/* Meeting Point */}
        <div>
          <label
            htmlFor="meetingPoint"
            className="text-sm font-semibold text-gray-900"
          >
            Meeting Point
          </label>

          <input
            id="meetingPoint"
            type="text"
            value={meetingPoint}
            onChange={(e) => setMeetingPoint(e.target.value)}
            placeholder="e.g. Manda Hill Shopping Centre"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d] text-gray-900"
          />
        </div>

      </div>
    </div>
  )
}