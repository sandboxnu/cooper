import dayjs from "dayjs";
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
import ExistingCompanyContent from "../../reviews/new-review/existing-company-content";
import { Select } from "../../themed/onboarding/select";
import { Label } from "node_modules/@cooper/ui/src/label";

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
      <div className=" text-cooper-gray-350 text-xs pt-2.5 md:pl-5 pl-2 ">
        Note: If your company isn’t in our database, we’ll ask for a few
        additional details to request it. Making a new company makes a new role.
      </div>
      <ExistingCompanyContent createdRolesCount={0} />
      <FormField
        control={form.control}
        name="workTerm"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-14 pl-2 md:pl-20">
            <FormLabel className="text-cooper-gray-400 text-sm">
              Co-op cycle
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-col gap-3"
              >
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="SPRING"
                      checked={field.value === "SPRING"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350">Spring</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="SUMMER"
                      checked={field.value === "SUMMER"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350">Summer</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="FALL"
                      checked={field.value === "FALL"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-350">Fall</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="workYear"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-14 pl-2 md:pl-20 pb-12">
            <Label className="text-cooper-gray-400 font-medium text-sm">
              Year
            </Label>
            <div className="w-fit">
              <FormControl>
                <Select
                  options={years.map((year) => ({ value: year, label: year }))}
                  className="w-[305px] border-2 rounded-lg h-10 text-sm text-cooper-gray-350 border-cooper-gray-150"
                  placeholder="Select year worked..."
                  {...field}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
