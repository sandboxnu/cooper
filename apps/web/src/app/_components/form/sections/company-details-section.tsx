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
import FilterBody from "../../filters/filter-body";

/**
 * CompanyDetailsSection component renders form fields for capturing
 * company details related to the co-op experience.
 */
export function CompanyDetailsSection() {
  const form = useFormContext();

  const benefits = [
    { field: "pto", label: "PTO" },
    { field: "federalHolidays", label: "Federal holidays off" },
    { field: "freeLunch", label: "Free lunch" },
    { field: "travelBenefits", label: "Travel benefits" },
    { field: "freeMerch", label: "Free merchandise" },
    { field: "snackBar", label: "Snack bar" },
    { field: "employeeLounge", label: "Employee lounge" },
  ];

  return (
    <FormSection>
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
      <FormField
        control={form.control}
        name="drugTest"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-4 ">
            <FormLabel className="text-cooper-gray-400 text-sm font-bold">
              Drug Test<span className="text-cooper-red-300">*</span>
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
        render={({ field }) => {
          const options = [1, 2, 3, 4, 5].map((n) => ({
            id: String(n),
            label: String(n),
            value: String(n),
          }));
          return (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-bold text-cooper-gray-400 pt-2.5">
                Company Culture<span className="text-cooper-red-300">*</span>
              </FormLabel>
              <FormControl className="relative flex-1">
                <FilterBody
                  variant="autocomplete"
                  title="Company Culture"
                  options={options}
                  selectedOptions={
                    field.value && field.value > 0 ? [String(field.value)] : []
                  }
                  placeholder="Select"
                  singleSelect
                  onSelectionChange={(selected) => {
                    const val = selected[0];
                    field.onChange(val ? Number(val) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="supervisorRating"
        render={({ field }) => {
          const options = [1, 2, 3, 4, 5].map((n) => ({
            id: String(n),
            label: String(n),
            value: String(n),
          }));
          return (
            <FormItem className="flex flex-col pt-2.5">
              <FormLabel className="text-sm font-bold text-cooper-gray-400">
                Supervisor rating<span className="text-cooper-red-300">*</span>
              </FormLabel>
              <FormControl className="relative flex-1">
                <FilterBody
                  variant="autocomplete"
                  title="Supervisor rating"
                  options={options}
                  selectedOptions={
                    field.value && field.value > 0 ? [String(field.value)] : []
                  }
                  placeholder="Select"
                  singleSelect
                  onSelectionChange={(selected) => {
                    const val = selected[0];
                    field.onChange(val ? Number(val) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
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
