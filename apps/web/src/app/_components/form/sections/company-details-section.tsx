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
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-semibold text-cooper-gray-400">
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
        name="overtimeNormal"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-14 pl-2 md:pl-0 pt-6 items-center">
            <FormLabel className="text-cooper-gray-400 text-sm md:w-60 text-right">
              Overtime
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-row space-x-3"
              >
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="false"
                      checked={field.value === "false"}
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="true"
                      checked={field.value === "true"}
                    />
                  </FormControl>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="companyCulture"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-semibold text-cooper-gray-400">
              Company culutre<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative flex-1">
              <Select
                onClear={() => field.onChange(undefined)}
                options={benefits}
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
        name="support"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-semibold text-cooper-gray-400">
              Co-op support<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative flex-1">
              <Select
                onClear={() => field.onChange(undefined)}
                options={benefits}
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
        name="benefits"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-sm font-semibold text-cooper-gray-400">
              Benefits<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative flex-1">
              <Select
                onClear={() => field.onChange(undefined)}
                options={benefits}
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
    </FormSection>
  );
}
