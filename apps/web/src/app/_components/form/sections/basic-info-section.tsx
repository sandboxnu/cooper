import { TriangleDownIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import { useFormContext } from "react-hook-form";

import { cn } from "@cooper/ui";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { RadioGroup, RadioGroupItem } from "@cooper/ui/radio-group";

import { FormSection } from "~/app/_components/form/form-section";
import { ChevronDown } from "lucide-react";
import ExistingCompanyContent from "../../reviews/new-review/existing-company-content";

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
      <div className=" text-cooper-gray-350 text-xs pt-2.5 pl-5">
        Note: If your company isn’t in our database, we’ll ask for a few
        additional details to request it. Making a new company makes a new role.
      </div>
      <ExistingCompanyContent createdRolesCount={0} />
      <FormField
        control={form.control}
        name="workTerm"
        render={({ field }) => (
          <FormItem className="space-y-6 flex flex-row gap-14">
            <FormLabel className="text-cooper-gray-400 text-sm">
              Co-op cycle*
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="SPRING"
                      checked={field.value === "SPRING"}
                    />
                  </FormControl>
                  <FormLabel>Spring</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="SUMMER"
                      checked={field.value === "SUMMER"}
                    />
                  </FormControl>
                  <FormLabel>Summer</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="FALL"
                      checked={field.value === "FALL"}
                    />
                  </FormControl>
                  <FormLabel>Fall</FormLabel>
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
          <FormItem className="flex flex-row gap-14">
            <FormLabel className="text-cooper-gray-400 font-medium text-sm">
              Year*
            </FormLabel>
            <div className="relative w-full">
              <FormControl>
                <select
                  className={cn(
                    "w-full appearance-none rounded-md border-2 border-cooper-gray-150 bg-transparent px-6 py-3 pr-8 text-md font-semibold text-cooper-gray-350",
                  )}
                  {...field}
                >
                  <option value={undefined}>Select year worked...</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </FormControl>
              <ChevronDown className="absolute right-5 top-5 h-6 w-6 text-cooper-gray-350" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
