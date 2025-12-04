import dayjs from "dayjs";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";

import { FormSection } from "~/app/_components/form/form-section";
import ExistingCompanyContent from "../../reviews/new-review/existing-company-content";
import { Select } from "../../themed/onboarding/select";

/**
 * CoopCycleSection component renders form fields for selecting co-op cycle and year.
 */
export function BasicInfoSection() {
  const form = useFormContext();

  // Need to evaluate whether this is a bad idea
  const currentYear = dayjs().year();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, index) => currentYear - index,
  );

  return (
    <FormSection>
      <ExistingCompanyContent />

      <FormField
        control={form.control}
        name="jobType"
        render={({ field }) => (
          <FormItem className="flex flex-col w-full">
            <FormLabel className="text-sm font-semibold text-cooper-gray-400">
              Employment type<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative w-full">
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: "Co-op", label: "Co-op" },
                  { value: "Internship", label: "Internship" },
                  { value: "Part time", label: "Part time" },
                ]}
                className="w-full border-cooper-gray-150 text-sm h-10"
                value={field.value ?? ""}
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
      <div className="flex flex-row gap-2 w-full">
        <FormField
          control={form.control}
          name="workTerm"
          render={({ field }) => (
            <FormItem className="flex flex-col flex-1">
              <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                Co-op/internship term<span className="text-[#FB7373]">*</span>
              </FormLabel>
              <FormControl className="relative w-full">
                <Select
                  onClear={() => field.onChange(undefined)}
                  options={[
                    { value: "SPRING", label: "Spring" },
                    { value: "SUMMER", label: "Summer" },
                    { value: "FALL", label: "Fall" },
                  ]}
                  className="w-full border-cooper-gray-150 text-sm h-10"
                  value={field.value ?? ""}
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
          name="workYear"
          render={({ field }) => (
            <FormItem className="flex flex-col flex-1">
              <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                Year<span className="text-[#FB7373]">*</span>
              </FormLabel>
              <FormControl className="relative w-full">
                <Select
                  options={years.map((year) => ({
                    value: year,
                    label: year,
                  }))}
                  className="w-full border-2 rounded-lg h-10 text-sm text-cooper-gray-350 border-cooper-gray-150"
                  placeholder="Select"
                  onClear={() => field.onChange(undefined)}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const value =
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormSection>
  );
}
