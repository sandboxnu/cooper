import { useState } from "react";
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
import { Textarea } from "@cooper/ui/textarea";

import { FormSection } from "~/app/_components/form/form-section";
import { benefits } from "~/app/_components/form/review-form";

interface CompanyDetailsSectionProps {
  companyName: string;
}

/**
 * CompanyDetailsSection component renders form fields for capturing
 * company details related to the co-op experience.
 */
export function CompanyDetailsSection(props: CompanyDetailsSectionProps) {
  const form = useFormContext();
  const [otherBenefits, setOtherBenefits] = useState(false);

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="workEnvironment"
        render={({ field }) => (
          <FormItem className="space-y-6 flex flex-row gap-14">
            <FormLabel>Work model*</FormLabel>
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
                      value="INPERSON"
                      checked={field.value === "INPERSON"}
                    />
                  </FormControl>
                  <FormLabel>In-person</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="HYBRID"
                      checked={field.value === "HYBRID"}
                    />
                  </FormControl>
                  <FormLabel>Hybrid</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="REMOTE"
                      checked={field.value === "REMOTE"}
                    />
                  </FormControl>
                  <FormLabel>Remote</FormLabel>
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
          <FormItem className="space-y-6 flex flex-row gap-14">
            <FormLabel>Drug test*</FormLabel>
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
                      value="true"
                      checked={field.value === "true"}
                    />
                  </FormControl>
                  <FormLabel>Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="false"
                      checked={field.value === "false"}
                    />
                  </FormControl>
                  <FormLabel>No</FormLabel>
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
          <FormItem className="space-y-6 flex flex-row gap-14">
            <FormLabel>Overtime*</FormLabel>
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
                      value="true"
                      checked={field.value === "true"}
                    />
                  </FormControl>
                  <FormLabel>Yes</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-4 space-y-0">
                  <FormControl>
                    <RadioGroupItem
                      value="false"
                      checked={field.value === "false"}
                    />
                  </FormControl>
                  <FormLabel>No</FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormLabel>Benefit(s)</FormLabel>
      {benefits.map((benefit) => (
        <FormField
          key={benefit.field}
          control={form.control}
          name={benefit.field}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-4 space-y-0">
              <FormControl>
                <Checkbox
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{benefit.label}</FormLabel>
            </FormItem>
          )}
        />
      ))}
    </FormSection>
  );
}
