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
  RadioGroup,
  RadioGroupItem,
  RadioGroupRect,
} from "@cooper/ui/radio-group";

import { FormSection } from "~/app/_components/form/form-section";
import { benefits } from "~/app/_components/form/review-form";

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
          <FormItem className=" flex flex-row gap-14 pl-2 md:pl-0 pt-6">
            <FormLabel className="text-cooper-gray-400 text-sm md:w-60 text-right">
              Work model
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
                      value="INPERSON"
                      checked={field.value === "INPERSON"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-450 text-sm">
                    In-person
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="HYBRID"
                      checked={field.value === "HYBRID"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-450 text-sm">
                    Hybrid
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="REMOTE"
                      checked={field.value === "REMOTE"}
                    />
                  </FormControl>
                  <FormLabel className="text-cooper-gray-450 text-sm">
                    Remote
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
        name="drugTest"
        render={({ field }) => (
          <FormItem className="flex flex-row gap-14 pl-2 md:pl-0 pt-6 items-center">
            <FormLabel className="text-cooper-gray-400 text-sm md:w-60 text-right">
              Drug test
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
                    <RadioGroupRect
                      value="false"
                      checked={field.value === "false"}
                      label="No"
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupRect
                      value="true"
                      checked={field.value === "true"}
                      label="Yes"
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
                    <RadioGroupRect
                      value="false"
                      checked={field.value === "false"}
                      label="No"
                    />
                  </FormControl>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupRect
                      value="true"
                      checked={field.value === "true"}
                      label="Yes"
                    />
                  </FormControl>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex flex-row">
        <div className="flex flex-col pl-2 md:pl-0 pt-6">
          <FormLabel className="text-cooper-gray-400 text-sm md:w-60 text-right">
            Benefit(s)
          </FormLabel>
          <button
            type="button"
            className="text-cooper-gray-350 text-xs cursor-pointer md:w-60 text-right"
            onClick={() => {
              benefits.forEach((benefit) => {
                form.setValue(benefit.field, false);
              });
            }}
          >
            Clear
          </button>
        </div>
        <div className="pl-2 md:pl-14 grid grid-flow-col gap-2.5 grid-rows-6 pb-10 gap-x-14 auto-rows-max pt-6 ">
          {benefits.map((benefit) => (
            <FormField
              key={benefit.field}
              control={form.control}
              name={benefit.field}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-4 space-y-0 text-sm">
                  <FormControl>
                    <Checkbox
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-6 h-6"
                    />
                  </FormControl>
                  <FormLabel>{benefit.label}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </FormSection>
  );
}
