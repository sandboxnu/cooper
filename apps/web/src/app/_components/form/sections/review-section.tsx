"use client";

import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { Textarea } from "@cooper/ui/textarea";

import {
  FieldHint,
  FieldLabel,
  SelectField,
} from "~/app/_components/form/fields";
import { FormSection } from "~/app/_components/form/form-section";

/**
 * ReviewSection renders the overall rating and written review.
 */
export function ReviewSection() {
  const form = useFormContext();

  return (
    <FormSection>
      <SelectField
        name="overallRating"
        label="Overall rating"
        required
        numeric
        options={[5, 4, 3, 2, 1].map((n) => ({
          id: String(n),
          label: String(n),
        }))}
      />
      <FormField
        control={form.control}
        name="textReview"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FieldLabel required>Review</FieldLabel>
            <FieldHint>
              Share what your peers would want to know about this experience.
              Please be respectful and don&apos;t mention anyone by name.
            </FieldHint>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter"
                className="min-h-32 w-full rounded-lg border border-cooper-gray-150 text-sm hover:bg-[#F6F6F6] focus:bg-white"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
