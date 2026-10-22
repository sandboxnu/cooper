"use client";

import { useFormContext } from "react-hook-form";

import { Checkbox } from "@cooper/ui/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";

import {
  FieldLabel,
  OPTION_LABEL_CLASS,
  YesNoField,
} from "~/app/_components/form/fields";
import { FormSection } from "~/app/_components/form/form-section";
import { Input } from "~/app/_components/themed/onboarding/input";

/**
 * PaySection renders hourly pay, overtime and PTO fields.
 */
export function PaySection() {
  const form = useFormContext();
  // Unpaid is stored as $0, so the checkbox follows the saved value
  const hourlyPay = form.watch("hourlyPay") as string | number | undefined;
  const isUnpaid = hourlyPay === "0" || hourlyPay === 0;

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="hourlyPay"
        render={({ field }) => (
          <FormItem className="flex w-full flex-col">
            <FieldLabel required>Hourly pay ($)</FieldLabel>
            <FormControl>
              <Input
                {...field}
                inputMode="decimal"
                placeholder="Enter"
                disabled={isUnpaid}
                className="disabled:cursor-default disabled:bg-cooper-gray-100 disabled:text-cooper-gray-400 disabled:opacity-100"
              />
            </FormControl>
            <div
              className="flex cursor-pointer items-center gap-2 pt-1"
              onClick={() => {
                form.setValue("hourlyPay", isUnpaid ? "" : "0", {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
            >
              <Checkbox checked={isUnpaid} />
              <span className={OPTION_LABEL_CLASS}>Unpaid position</span>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <YesNoField name="overtimeNormal" label="Worked overtime" />
      <YesNoField name="pto" label="Received PTO" />
    </FormSection>
  );
}
