import { useFormContext } from "react-hook-form";

import { Checkbox } from "@cooper/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";

import {
  FieldHint,
  FieldLabel,
  FieldRow,
  OPTION_LABEL_CLASS,
  SelectField,
  YesNoField,
} from "~/app/_components/form/fields";
import { FormSection } from "~/app/_components/form/form-section";
import { Input } from "~/app/_components/themed/onboarding/input";
import FilterBody from "../../filters/filter-body";
import { ToolsAutocomplete } from "./tools-autocomplete";

/**
 * CompanyDetailsSection component renders form fields for capturing
 * company details related to the co-op experience.
 */
export function CompanyDetailsSection() {
  const form = useFormContext();

  const benefits = [
    { field: "freeLunch", label: "Free lunch" },
    { field: "travelBenefits", label: "Travel benefits" },
    { field: "freeMerch", label: "Free merchandise" },
    { field: "snackBar", label: "Snack bar" },
  ] as const;

  const selectedBenefits = benefits
    .filter((benefit) => Boolean(form.watch(benefit.field)))
    .map((benefit) => benefit.field);

  const coopSupportOptions = [
    {
      field: "onboarding" as const,
      label: "Onboarding",
      description:
        "I was properly onboarded into the company and role, with clear communication ahead of my first day.",
    },
    {
      field: "workStructure" as const,
      label: "Work structure",
      description:
        "Expectations for my work were well-defined and my tasks were accurate to the job description.",
    },
    {
      field: "careerGrowth" as const,
      label: "Career growth",
      description:
        "I gained skills and knowledge that will contribute meaningfully to my long-term professional development.",
    },
  ];

  return (
    <FormSection>
      <FieldRow>
        <SelectField
          name="workEnvironment"
          label="Work model"
          required
          options={[
            { id: "INPERSON", label: "In person" },
            { id: "HYBRID", label: "Hybrid" },
            { id: "REMOTE", label: "Remote" },
          ]}
        />
        <FormField
          control={form.control}
          name="workHours"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FieldLabel required>Hours per week</FieldLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Enter"
                  value={(field.value as number | null) ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  onClear={() => field.onChange(null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldRow>

      <YesNoField
        name="federalHolidays"
        label="Federal holidays off"
        yesValue="true"
        noValue="false"
      />
      <YesNoField name="drugTest" label="Drug test required" />
      <YesNoField
        name="accessibleByTransportation"
        label="Accessible by transit"
        yesValue="true"
        noValue="false"
      />

      {/* Company culture */}
      <FormItem className="flex flex-col">
        <FieldLabel>Company culture</FieldLabel>
        <FieldHint>Check all that were common at the company</FieldHint>
        <div className="flex flex-col gap-2 pt-1">
          {(
            [
              { field: "teamOutings", label: "Team outings" },
              { field: "coffeeChats", label: "Coffee chats" },
              { field: "constructiveFeedback", label: "Constructive feedback" },
            ] as const
          ).map(({ field, label }) => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={!!f.value}
                      onCheckedChange={f.onChange}
                    />
                  </FormControl>
                  <FormLabel className={OPTION_LABEL_CLASS}>{label}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </FormItem>

      {/* Co-op support */}
      <FormItem className="flex flex-col">
        <FieldLabel>Co-op support</FieldLabel>
        <FieldHint>Check the statements you agree with</FieldHint>
        <div className="flex flex-col gap-3 pt-1">
          {coopSupportOptions.map(({ field, label, description }) => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem className="flex items-start gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={!!f.value}
                      onCheckedChange={f.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="flex flex-col gap-0.5">
                    <FormLabel className="cursor-pointer text-sm font-semibold text-cooper-gray-400">
                      {label}
                    </FormLabel>
                    <p className="text-sm text-cooper-gray-350">
                      {description}
                    </p>
                  </div>
                </FormItem>
              )}
            />
          ))}
        </div>
      </FormItem>

      {/* Benefits */}
      <FormItem className="flex flex-col">
        <FieldLabel>Benefits</FieldLabel>
        <FormControl className="relative flex-1">
          <FilterBody
            title="Benefits"
            variant="autocomplete"
            options={benefits.map((benefit) => ({
              id: benefit.field,
              label: benefit.label,
            }))}
            selectedOptions={selectedBenefits}
            placeholder="Enter"
            onSelectionChange={(selected) => {
              benefits.forEach((benefit) => {
                form.setValue(benefit.field, selected.includes(benefit.field), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              });
            }}
            isInMenuContent={true}
          />
        </FormControl>
      </FormItem>

      {/* Tools and software */}
      <FormField
        control={form.control}
        name="toolNames"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FieldLabel>Tools and software</FieldLabel>
            <FormControl>
              <ToolsAutocomplete
                value={(field.value as string[] | undefined) ?? []}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
