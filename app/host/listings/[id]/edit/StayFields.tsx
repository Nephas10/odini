type Props = {
  maxGuests: string
  setMaxGuests: (value: string) => void
}

export default function StayFields({
  maxGuests,
  setMaxGuests,
}: Props) {
  return (
    <div className="space-y-6 border-t border-gray-100 pt-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Stay Details
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Update the details of your stay.
        </p>
      </div>

      {/* Maximum Guests */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Maximum Guests
        </label>

        <input
          type="number"
          min="1"
          value={maxGuests}
          onChange={(e) => setMaxGuests(e.target.value)}
          placeholder="e.g. 4"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#e8365d] text-gray-900"
        />
      </div>
    </div>
  )
}