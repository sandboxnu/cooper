"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { FormSection } from "~/app/_components/form/form-section";
import { InterviewRoundItem } from "./interview-round-item";

export function InterviewSection() {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "interviewRounds",
  });

  return (
    <FormSection>
      <div className="w-full space-y-4">
        {fields.map((field, index) => (
          <InterviewRoundItem
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
        <button
          type="button"
          onClick={() =>
            append({ interviewType: undefined, interviewDifficulty: undefined })
          }
          className="pl-20 font-bold text-cooper-gray-350"
        >
          + Add interview round
        </button>
      </div>
    </FormSection>
  );
}
