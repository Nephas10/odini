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
    <div className="space-y-6 border-t border-gray-100 pt-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Activity Details
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update the details of your activity.
        </p>
      </div>

      {/* Activity Category */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Activity Category
        </label>

        <input
          type="text"
          value={activityCategory}
          onChange={(e) => setActivityCategory(e.target.value)}
          placeholder="e.g. Tour, Hiking, Cooking"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* Duration */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Duration (minutes)
        </label>

        <input
          type="number"
          min="1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g. 120"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* Maximum Participants */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Maximum Participants
        </label>

        <input
          type="number"
          min="1"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          placeholder="e.g. 10"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>

      {/* Meeting Point */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Meeting Point
        </label>

        <input
          type="text"
          value={meetingPoint}
          onChange={(e) => setMeetingPoint(e.target.value)}
          placeholder="e.g. Main entrance"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>
    </div>
  )
}