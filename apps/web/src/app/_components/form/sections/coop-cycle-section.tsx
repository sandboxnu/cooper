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

interface CoopCycleSectionProps {
  textColor: string;
}

/**
 * CoopCycleSection component renders form fields for selecting co-op cycle and year.
 */
export function CoopCycleSection({ textColor }: CoopCycleSectionProps) {
  const form = useFormContext();

  // Need to evaluate whether this is a bad idea
  const currentYear = dayjs().year();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, index) => currentYear - index,
  );

  return (
    <FormSection title="Co-op Cycle" className={textColor}>
      <FormField
        control={form.control}
        name="workTerm"
        render={({ field }) => (
          <FormItem className="space-y-6">
            <FormLabel>Co-op Cycle*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                defaultValue={field.value}
                className="flex flex-col space-y-3"
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
                      value="FALL"
                      checked={field.value === "FALL"}
                    />
                  </FormControl>
                  <FormLabel>Fall</FormLabel>
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
          <FormItem>
            <FormLabel>Co-op Year*</FormLabel>
            <div className="relative w-full">
              <FormControl>
                <select
                  className={cn(
                    "w-full appearance-none rounded-md border-2 border-cooper-blue-600 bg-transparent px-6 py-3 pr-8 text-2xl font-semibold text-cooper-blue-600",
                  )}
                  {...field}
                >
                  <option value={undefined}>Select the year you co-oped</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </FormControl>
              <TriangleDownIcon className="absolute right-5 top-5 h-6 w-6 text-cooper-blue-600" />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
