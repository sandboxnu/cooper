import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { FormSection } from "~/components/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";

import { benefits } from "~/components/review-form";
import { Textarea } from "./ui/textarea";

type CompanyDetailsSectionProps = {
  companyName: string;
};

/**
 * CompanyDetailsSection component renders form fields for capturing
 * company details related to the co-op experience.
 */
export function CompanyDetailsSection(props: CompanyDetailsSectionProps) {
  const form = useFormContext();
  const [otherBenefits, setOtherBenefits] = useState(false);

  return (
    <FormSection title="Company Details" className="text-cooper-red-500">
      <FormField
        control={form.control}
        name="workEnvironment"
        render={({ field }) => (
          <FormItem className="space-y-6">
            <FormLabel>What kind of work model?*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
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
          <FormItem className="space-y-6">
            <FormLabel>Did {props.companyName} drug test?*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
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
          <FormItem className="space-y-6">
            <FormLabel>Was working overtime common?*</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
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
      <FormLabel>
        Select the benefit(s) that {props.companyName} offered
      </FormLabel>
      {benefits.map((benefit) => (
        <FormField
          key={benefit.field}
          control={form.control}
          name={benefit.field}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-4 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{benefit.label}</FormLabel>
            </FormItem>
          )}
        />
      ))}
      <FormItem className="flex flex-row items-start space-x-4 space-y-0">
        <Checkbox
          checked={otherBenefits}
          onCheckedChange={(c) => setOtherBenefits(!!c)}
        />
        <FormLabel>Other</FormLabel>
        <FormMessage />
      </FormItem>
      {otherBenefits && (
        <FormField
          control={form.control}
          name="otherBenefits"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Please type the other benefits here."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </FormSection>
  );
}
