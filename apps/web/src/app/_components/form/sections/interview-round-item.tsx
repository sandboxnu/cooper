"use client";

import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";

import FilterBody from "../../filters/filter-body";

interface InterviewRoundItemProps {
  index: number;
  onRemove: () => void;
}

export function InterviewRoundItem({
  index,
  onRemove,
}: InterviewRoundItemProps) {
  const form = useFormContext();

  return (
    <div className="flex w-full flex-col items-end">
      <button type="button" onClick={onRemove}>
        <X className="h-4 w-4 text-cooper-gray-400" />
      </button>
      <div className="flex w-full gap-7">
        <span className="text-md flex-shrink-0 font-bold text-cooper-gray-550">
          Round {index + 1}
        </span>
        <div className="grid flex-1 grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`interviewRounds.${index}.interviewType`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                  Interview type
                </FormLabel>
                <FormControl>
                  <FilterBody
                    variant="autocomplete"
                    title="Interview type"
                    options={[
                      { id: "behavioral", label: "Behavioral" },
                      { id: "technical", label: "Technical" },
                      { id: "case_study", label: "Case study" },
                      {
                        id: "portfolio_walkthrough",
                        label: "Portfolio walkthrough",
                      },
                      { id: "online_assessment", label: "Online assessment" },
                      { id: "screening", label: "Screening" },
                      { id: "other", label: "Other" },
                    ]}
                    selectedOptions={field.value ? [field.value] : []}
                    placeholder="Select"
                    singleSelect
                    onSelectionChange={(selected) => {
                      field.onChange(selected[0] ?? undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`interviewRounds.${index}.interviewDifficulty`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                  Difficulty
                </FormLabel>
                <FormControl>
                  <FilterBody
                    variant="autocomplete"
                    title="Difficulty"
                    options={[
                      { id: "easy", label: "Easier than other interviews" },
                      {
                        id: "average",
                        label: "About the same as other interviews",
                      },
                      { id: "hard", label: "Harder than other interviews" },
                    ]}
                    selectedOptions={field.value ? [field.value] : []}
                    placeholder="Select"
                    singleSelect
                    onSelectionChange={(selected) => {
                      field.onChange(selected[0] ?? undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
