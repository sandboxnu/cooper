import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { RadioGroup, RadioGroupItem } from "@cooper/ui/radio-group";

import { FormSection } from "~/app/_components/form/form-section";
import { benefits } from "~/app/(pages)/(protected)/review-form/page";
import { Select } from "../../themed/onboarding/select";
import FilterBody from "../../filters/filter-body";

/**
 * CompanyDetailsSection component renders form fields for capturing
 * company details related to the co-op experience.
 */
export function CompanyDetailsSection() {
  const form = useFormContext();

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="workEnvironment"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-5">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Work model<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl>
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: "INPERSON", label: "In person" },
                  { value: "HYBRID", label: "Hybrid" },
                  { value: "REMOTE", label: "Remote" },
                ]}
                className="w-full border-cooper-gray-150 text-sm h-10"
                value={
                  field.value &&
                  typeof field.value === "string" &&
                  field.value.length > 0
                    ? field.value
                    : ""
                }
                placeholder="Select"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="drugTest"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4 ">
            <FormLabel className="text-cooper-gray-400 text-sm font-bold">
              Drug Test<span className="text-[#FB7373]">*</span>
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
      <FormField
        control={form.control}
        name="cultureRating"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-bold text-cooper-gray-400 pt-2.5">
              Company Culture<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative flex-1">
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: 1, label: 1 },
                  { value: 2, label: 2 },
                  { value: 3, label: 3 },
                  { value: 4, label: 4 },
                  { value: 5, label: 5 },
                ]}
                className="w-full border-cooper-gray-150 text-sm h-10"
                value={
                  field.value && field.value > 0 ? String(field.value) : ""
                }
                placeholder="Select"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="supervisorRating"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-2.5">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Supervisor rating<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative flex-1">
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: 1, label: 1 },
                  { value: 2, label: 2 },
                  { value: 3, label: 3 },
                  { value: 4, label: 4 },
                  { value: 5, label: 5 },
                ]}
                className="w-full border-cooper-gray-150 text-sm h-10"
                value={
                  field.value && field.value > 0 ? String(field.value) : ""
                }
                placeholder="Select"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="benefits"
        render={({ field }) => (
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
                selectedOptions={
                  Array.isArray(field.value)
                    ? field.value
                    : field.value
                      ? [field.value]
                      : []
                }
                placeholder="Select benefits"
                onSelectionChange={(selected) => {
                  field.onChange(selected.length > 0 ? selected : undefined);
                }}
                isInMenuContent={true}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
