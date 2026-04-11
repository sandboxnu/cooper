import { useFormContext } from "react-hook-form";

import { Checkbox } from "@cooper/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { RadioGroup, RadioGroupItem } from "@cooper/ui/radio-group";

import { Input } from "~/app/_components/themed/onboarding/input";
import { FormSection } from "~/app/_components/form/form-section";
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
      {/* Work model */}
      <FormField
        control={form.control}
        name="workEnvironment"
        render={({ field }) => {
          const options = [
            { id: "INPERSON", label: "In person" },
            { id: "HYBRID", label: "Hybrid" },
            { id: "REMOTE", label: "Remote" },
          ];
          return (
            <FormItem className="flex flex-col pt-5">
              <FormLabel className="text-sm font-bold text-cooper-gray-400">
                Work model<span className="text-cooper-red-300">*</span>
              </FormLabel>
              <FormControl>
                <FilterBody
                  variant="autocomplete"
                  title="Work model"
                  options={options}
                  selectedOptions={
                    field.value &&
                    typeof field.value === "string" &&
                    field.value.length > 0
                      ? [field.value]
                      : []
                  }
                  placeholder="Select"
                  singleSelect
                  onSelectionChange={(selected) => {
                    field.onChange(selected[0] ?? undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Work hours */}
      <FormField
        control={form.control}
        name="workHours"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Work hours<span className="text-cooper-red-300">*</span>
            </FormLabel>
            <p className="text-xs text-cooper-gray-350">
              Hours worked per week, not including overtime (i.e. 40, 36, 20)
            </p>
            <FormControl>
              <Input
                type="number"
                min={1}
                step={1}
                placeholder="Enter work hours"
                value={field.value ?? ""}
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

      {/* Federal holidays off */}
      <FormField
        control={form.control}
        name="federalHolidays"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Federal holidays off
              <span className="text-cooper-red-300">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-row space-x-3"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="true"
                      checked={field.value === "true"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    Yes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="false"
                      checked={field.value === "false"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    No
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Drug test required */}
      <FormField
        control={form.control}
        name="drugTest"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4 ">
            <FormLabel className="text-cooper-gray-400 text-sm font-bold">
              Drug test required<span className="text-cooper-red-300">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-row space-x-3"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="yes"
                      checked={field.value === "yes"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    Yes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="no" checked={field.value === "no"} />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    No
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Accessible by transportation */}
      <FormField
        control={form.control}
        name="accessibleByTransportation"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Accessible by transportation
              <span className="text-cooper-red-300">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-row space-x-3"
              >
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="true"
                      checked={field.value === "true"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    Yes
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="false"
                      checked={field.value === "false"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350 text-sm">
                    No
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Company culture */}
      <FormItem className="flex flex-col pt-4">
        <FormLabel className="text-sm font-bold text-cooper-gray-400">
          Company culture (check all that were common practices in the company)
        </FormLabel>
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
                  <FormLabel className="cursor-pointer text-sm font-normal text-cooper-gray-400">
                    {label}
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </FormItem>

      {/* Co-op support */}
      <FormItem className="flex flex-col pt-4">
        <FormLabel className="text-sm font-bold text-cooper-gray-400">
          Co-op support (check if you agree with the statement)
        </FormLabel>
        <div className="flex flex-col gap-3 pt-1">
          {coopSupportOptions.map(({ field, label, description }) => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field: f }) => (
                <FormItem className="space-y-0">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={!!f.value}
                        onCheckedChange={f.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer text-sm font-semibold text-cooper-gray-400">
                      {label}
                    </FormLabel>
                  </div>
                  <p className="pl-[31px] pt-0.5 text-xs text-cooper-gray-350">
                    {description}
                  </p>
                </FormItem>
              )}
            />
          ))}
        </div>
      </FormItem>

      {/* Benefits */}
      <FormItem className="flex flex-col pt-2.5">
        <FormLabel className="text-sm font-bold text-cooper-gray-400">
          Benefits
        </FormLabel>
        <FormControl className="relative flex-1">
          <FilterBody
            title="Benefits"
            variant="autocomplete"
            options={benefits.map((benefit) => ({
              id: benefit.field,
              label: benefit.label,
            }))}
            selectedOptions={selectedBenefits}
            placeholder="Select benefits"
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
          <FormItem className="flex flex-col pt-2.5">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Tools and software
            </FormLabel>
            <p className="text-xs text-cooper-gray-350">
              Tools and software you used on the job
            </p>
            <FormControl>
              <ToolsAutocomplete
                value={field.value ?? []}
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
