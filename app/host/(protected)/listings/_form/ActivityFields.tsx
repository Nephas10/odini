import { DAYS, type ActivityRow } from "./fields"
import { CheckChips, Field, Input, Section, TextArea } from "./ui"

type Props = {
  defaults?: Partial<ActivityRow>
  errors?: Record<string, string>
}

const CATEGORIES = ["Safari", "Boat cruise", "Adventure", "Cultural tour", "Hiking", "Food & drink", "Class / workshop", "Sightseeing"]

// The extra fields for an activity. Used by both create and edit.
export default function ActivityFields({ defaults = {}, errors }: Props) {
  return (
    <>
      <Section title="Activity details">
        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            name="activity_category"
            label="Category"
            list="activity-category-options"
            placeholder="e.g. Boat cruise"
            defaultValue={defaults.activity_category ?? ""}
            errors={errors}
          />
          <Input
            name="duration_minutes"
            label="Duration (minutes)"
            type="number"
            min={1}
            max={10080}
            inputMode="numeric"
            hint="e.g. 90 for an hour and a half."
            defaultValue={defaults.duration_minutes ?? ""}
            errors={errors}
          />
          <Input
            name="max_participants"
            label="Maximum group size"
            type="number"
            min={1}
            max={1000}
            inputMode="numeric"
            defaultValue={defaults.max_participants ?? ""}
            errors={errors}
          />
        </div>
        <datalist id="activity-category-options">
          {CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <Input
          name="meeting_point"
          label="Meeting point"
          required
          placeholder="e.g. Main gate, Mosi-oa-Tunya National Park"
          hint="Where guests should go on the day."
          defaultValue={defaults.meeting_point ?? ""}
          errors={errors}
        />
      </Section>

      <Section title="When it runs" description="Guests pick a date when they book. This tells them which days and times work.">
        <Field label="Days it runs" hint="Leave all unticked if it runs any day.">
          <CheckChips name="available_days" options={DAYS} defaultValues={defaults.available_days ?? []} />
        </Field>

        <Input
          name="start_times"
          label="Start times"
          placeholder="e.g. 08:00, 14:30"
          hint="Separate several times with commas."
          defaultValue={(defaults.start_times ?? []).join(", ")}
          errors={errors}
        />
      </Section>

      <Section title="Before guests come" description="What they need to know to stay safe and prepared.">
        <div className="sm:w-1/3">
          <Input
            name="min_age"
            label="Minimum age"
            type="number"
            min={0}
            max={99}
            inputMode="numeric"
            hint="Leave empty if all ages are welcome."
            defaultValue={defaults.min_age ?? ""}
            errors={errors}
          />
        </div>

        <TextArea
          name="what_to_bring"
          label="What to bring or know"
          placeholder="e.g. Comfortable shoes, sunscreen and water. Moderate fitness needed."
          defaultValue={defaults.what_to_bring ?? ""}
          errors={errors}
        />

        <TextArea
          name="safety_info"
          label="Safety information"
          placeholder="e.g. Life jackets provided. A trained guide stays with the group throughout."
          defaultValue={defaults.safety_info ?? ""}
          errors={errors}
        />
      </Section>
    </>
  )
}