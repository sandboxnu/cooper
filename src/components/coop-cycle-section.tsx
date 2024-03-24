import { useFormContext } from "react-hook-form";
import { FormSection } from "~/components/form-section";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import FormLabel from "./cooper/form-label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import dayjs from "dayjs";

/**
 * CoopCycleSection component renders form fields for selecting co-op cycle and year.
 */
export function CoopCycleSection() {
  const form = useFormContext();

  // Need to evaluate whether this is a bad idea
  const currentYear = dayjs().year();
  const years = Array.from(
    { length: currentYear - 1999 },
    (_, index) => currentYear - index,
  );

  return (
    <FormSection title="Co-op Cycle" className="text-cooper-pink-500">
      <FormField
        control={form.control}
        name="workTerm"
        render={({ field }) => (
          <FormItem className="space-y-6">
            <FormLabel>Co-op Cycle*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
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
                <FormItem className="flex items-center  space-x-4 space-y-0">
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
