"use client";

import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { Textarea } from "@cooper/ui/textarea";

import { FormSection } from "~/app/_components/form/form-section";
import { Select } from "../../themed/onboarding/select";

/**
 * ReviewSection component renders form fields for writing a co-op review.
 */
export function ReviewSection() {
  const form = useFormContext();

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="overallRating"
        render={({ field }) => (
          <FormItem className="flex flex-col pt-3">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Overall rating<span className="text-cooper-red-300">*</span>
            </FormLabel>
            <FormControl className="relative flex-1">
              <Select
                onClear={() => field.onChange(undefined)}
                options={[
                  { value: 1, label: 1 },
                  { value: 2, label: 2 },
                  { value: 3, label: 3 },
                  { value: 4, label: 4 },
                  { value: 5, label: 5 },
                ]}
                className="w-full border-cooper-gray-150 text-sm h-10"
                value={
                  field.value && field.value > 0 ? String(field.value) : ""
                }
                placeholder="Select"
                onChange={(e) => {
                  const value =
                    e.target.value === "" ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="textReview"
        render={({ field }) => (
          <FormItem className="flex flex-col md:flex-col pt-4">
            <FormLabel className="text-sm font-bold text-cooper-gray-400 ">
              Review text<span className="text-cooper-red-300">*</span>
            </FormLabel>
            <div className="text-cooper-gray-550 text-xs">
              This is your chance to share more details on your experience.
              Think about what your peers would want to know about this
              experience. Please be respectful and do not mention any specific
              names.
            </div>
            <div className="flex-1">
              <Textarea
                {...field}
                placeholder="i.e. job duties not mentioned in the job description, co-op program at the company, etc."
                className="border border-cooper-gray-150 w-full text-sm"
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
