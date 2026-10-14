"use client"

import { useActionState, useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import { BedDouble, CalendarDays, Compass } from "lucide-react"
import {
  DEFAULT_CANCELLATION_TERMS,
  LISTING_TYPES,
  type ActivityRow,
  type EventRow,
  type ListingRow,
  type ListingType,
  type StayRow,
} from "./fields"
import type { ListingFormState } from "./action"
import { Field, Input, Section, TextArea } from "./ui"
import PhotoUploader from "./PhotoUploader"
import StayFields from "./StayFields"
import EventFields from "./EventFields"
import ActivityFields from "./ActivityFields"

type Props = {
  userId: string
  // createListing, or (later) updateListing
  action: (state: ListingFormState, formData: FormData) => Promise<ListingFormState>
  // Edit only: the listing's current values, and its type (which can't be changed)
  defaults?: Partial<ListingRow> & { details?: Partial<StayRow & EventRow & ActivityRow> }
  lockedType?: ListingType
  ticketsSold?: number
}

const TYPE_ICONS = { stay: BedDouble, event: CalendarDays, activity: Compass }

const PRICE_LABEL: Record<ListingType, string> = {
  stay: "Price per night (K)",
  event: "Price per ticket (K)",
  activity: "Price per person (K)",
}

const TOWNS = ["Lusaka", "Livingstone", "Ndola", "Kitwe", "Kabwe", "Chipata", "Siavonga", "Solwezi", "Kasama", "Mongu", "Kafue"]

// The whole listing form. Only collects input: checking happens in fields.ts,
// saving in actions.ts.
export default function ListingForm({ userId, action, defaults = {}, lockedType, ticketsSold }: Props) {
  const [state, formAction] = useActionState(action, {})
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState<ListingType>(lockedType ?? defaults.listing_type ?? "stay")
  const topRef = useRef<HTMLDivElement>(null)

  const errors = state.errors

  // Jump back to the top when there's a problem, so the host sees the message
  useEffect(() => {
    if (state.error) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [state])

  // Submit without clearing the form (React clears forms after a normal form action,
  // which would wipe everything the host typed if there's a mistake)
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const formData = new FormData(event.currentTarget, submitter)
    startTransition(() => formAction(formData))
  }

  const details = defaults.details ?? {}

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div ref={topRef} className="scroll-mt-28" />

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>
      )}

      {/* 1. Type */}
      <input type="hidden" name="listing_type" value={type} />
      {!lockedType && (
        <Section title="What are you listing?">
          <div className="grid gap-3 sm:grid-cols-3">
            {LISTING_TYPES.map((option) => {
              const Icon = TYPE_ICONS[option.value]
              const selected = option.value === type
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={selected}
                  className={`rounded-xl border-2 p-4 text-left transition ${
                    selected
                      ? "border-[#7A1F2B] bg-[#F7EDEF]"
                      : "border-gray-200 bg-white hover:border-[#7A1F2B]/40"
                  }`}
                >
                  <Icon size={22} className={selected ? "text-[#7A1F2B]" : "text-gray-400"} />
                  <p className="mt-2 font-semibold text-gray-900">{option.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{option.hint}</p>
                </button>
              )
            })}
          </div>
          {errors?.listing_type && <p className="text-xs text-red-600">{errors.listing_type}</p>}
        </Section>
      )}

      {/* 2. Basics */}
      <Section title="The basics" description="What guests see first.">
        <Input
          name="title"
          label="Title"
          required
          maxLength={100}
          placeholder={
            type === "stay"
              ? "e.g. Riverside Lodge with Pool"
              : type === "event"
                ? "e.g. Lusaka Jazz Night"
                : "e.g. Sunset Boat Cruise on the Zambezi"
          }
          defaultValue={defaults.title ?? ""}
          errors={errors}
        />

        <TextArea
          name="description"
          label="Description"
          rows={5}
          placeholder="What makes it special? What will guests experience?"
          defaultValue={defaults.description ?? ""}
          errors={errors}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="location"
            label="Location"
            required
            list="town-options"
            placeholder="e.g. Lusaka"
            hint="Town or area. Guests filter by this."
            defaultValue={defaults.location ?? ""}
            errors={errors}
          />
          <Input
            name="price"
            label={PRICE_LABEL[type]}
            type="number"
            min={0}
            inputMode="numeric"
            required
            placeholder="e.g. 500"
            defaultValue={defaults.price ?? ""}
            errors={errors}
          />
        </div>
        <datalist id="town-options">
          {TOWNS.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>

        <Field label="Photos" required error={undefined}>
          <PhotoUploader userId={userId} defaultPhotos={defaults.photos ?? []} error={errors?.photos} />
        </Field>
      </Section>

      {/* 3. Type-specific details (switch type and these change) */}
      {type === "stay" && <StayFields defaults={details} errors={errors} />}
      {type === "event" && <EventFields defaults={details} errors={errors} ticketsSold={ticketsSold} />}
      {type === "activity" && <ActivityFields defaults={details} errors={errors} />}

      {/* 4. What guests must know (Terms sections 7–9) */}
      <Section title="Before guests book" description="Shown to guests before they book, as required by ODINI's Terms.">
        <TextArea
          name="cancellation_terms"
          label="Cancellation and refund terms"
          required
          rows={3}
          defaultValue={defaults.cancellation_terms ?? DEFAULT_CANCELLATION_TERMS}
          errors={errors}
        />
        <TextArea
          name="accessibility_info"
          label="Accessibility"
          rows={2}
          placeholder="e.g. Ground-floor rooms, step-free entrance. Not suitable for wheelchairs: steep path to the river."
          defaultValue={defaults.accessibility_info ?? ""}
          errors={errors}
        />
      </Section>

      {/* 5. Save */}
      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border sm:shadow-sm">
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={isPending}
          className="rounded-full border border-[#7A1F2B]/30 px-6 py-3 text-sm font-semibold text-[#7A1F2B] transition hover:bg-[#F7EDEF] disabled:opacity-50"
        >
          Save as draft
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={isPending}
          className="rounded-full bg-[#7A1F2B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5E1721] disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Publish listing"}
        </button>
      </div>
    </form>
  )
}