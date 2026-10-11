type Props = {
  maxGuests: string
  setMaxGuests: (value: string) => void
}

export default function StayFields({
  maxGuests,
  setMaxGuests,
}: Props) {
  return (
    <div className="mt-8 border-t border-gray-100 pt-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Stay Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Provide information about the accommodation.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="maxGuests"
          className="text-sm font-semibold text-gray-900"
        >
          Maximum Guests
        </label>

        <input
          id="maxGuests"
          type="number"
          min="1"
          value={maxGuests}
          onChange={(e) => setMaxGuests(e.target.value)}
          placeholder="e.g. 4"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#e8365d]"
        />

        <p className="mt-1 text-xs text-gray-400">
          Maximum number of guests the stay can accommodate.
        </p>
      </div>
    </div>
  )
}