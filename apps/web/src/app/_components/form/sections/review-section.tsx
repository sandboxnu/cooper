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
import FilterBody from "../../filters/filter-body";

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
        render={({ field }) => {
          const options = [1, 2, 3, 4, 5].map((n) => ({
            id: String(n),
            label: String(n),
            value: String(n),
          }));
          return (
            <FormItem className="flex flex-col pt-3">
              <FormLabel className="text-sm font-bold text-cooper-gray-400">
                Overall rating<span className="text-cooper-red-300">*</span>
              </FormLabel>
              <FormControl className="relative flex-1">
                <FilterBody
                  variant="autocomplete"
                  title="Overall rating"
                  options={options}
                  selectedOptions={
                    field.value && field.value > 0 ? [String(field.value)] : []
                  }
                  placeholder="Select"
                  singleSelect
                  onSelectionChange={(selected) => {
                    const val = selected[0];
                    field.onChange(val ? Number(val) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
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
                className="border-cooper-gray-150 w-full border text-sm"
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  );
}
