import { AMENITIES, type StayRow } from "./fields"
import { CheckChips, Field, Input, Section, TextArea } from "./ui"

type Props = {
  defaults?: Partial<StayRow>
  errors?: Record<string, string>
}

// The extra fields for a stay. Used by both create and edit.
export default function StayFields({ defaults = {}, errors }: Props) {
  return (
    <>
      <Section title="Rooms and guests" description="Who and how many you can host.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            name="max_guests"
            label="Maximum guests"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            required
            defaultValue={defaults.max_guests ?? ""}
            errors={errors}
          />
          <Input
            name="available_rooms"
            label="Rooms available"
            type="number"
            min={0}
            max={500}
            inputMode="numeric"
            hint="How many rooms or units you can book out."
            defaultValue={defaults.available_rooms ?? ""}
            errors={errors}
          />
          <Input
            name="bedrooms"
            label="Bedrooms"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            defaultValue={defaults.bedrooms ?? ""}
            errors={errors}
          />
          <Input
            name="bathrooms"
            label="Bathrooms"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            defaultValue={defaults.bathrooms ?? ""}
            errors={errors}
          />
        </div>
      </Section>

      <Section title="Check-in and stay length">
        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            name="check_in_time"
            label="Check-in from"
            type="time"
            defaultValue={defaults.check_in_time?.slice(0, 5) ?? ""}
            errors={errors}
          />
          <Input
            name="check_out_time"
            label="Check-out by"
            type="time"
            defaultValue={defaults.check_out_time?.slice(0, 5) ?? ""}
            errors={errors}
          />
          <Input
            name="duration_nights"
            label="Minimum nights"
            type="number"
            min={1}
            max={60}
            inputMode="numeric"
            hint="Leave empty for no minimum."
            defaultValue={defaults.duration_nights ?? ""}
            errors={errors}
          />
        </div>
      </Section>

      <Section title="What guests get" description="Tap everything that's available.">
        <Field label="Amenities">
          <CheckChips name="amenities" options={AMENITIES} defaultValues={defaults.amenities ?? []} />
        </Field>

        <TextArea
          name="house_rules"
          label="House rules"
          placeholder="e.g. No smoking indoors. Quiet hours after 22:00. No parties."
          defaultValue={defaults.house_rules ?? ""}
          errors={errors}
        />

        <TextArea
          name="extra_charges"
          label="Extra charges"
          rows={2}
          hint="Anything guests pay on top of the nightly price, so there are no surprises."
          placeholder="e.g. Cleaning fee K150 per stay. Tourism levy included."
          defaultValue={defaults.extra_charges ?? ""}
          errors={errors}
        />
      </Section>
    </>
  )
}