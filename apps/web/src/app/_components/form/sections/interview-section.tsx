"use client";

import { useFieldArray, useFormContext } from "react-hook-form";

import { useReadOnly } from "@cooper/ui/read-only";

import { FieldHint } from "~/app/_components/form/fields";
import { FormSection } from "~/app/_components/form/form-section";
import { InterviewRoundItem } from "./interview-round-item";

export function InterviewSection() {
  const form = useFormContext();
  const readOnly = useReadOnly();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "interviewRounds",
  });

  return (
    <FormSection>
      {fields.length === 0 && (
        <FieldHint>
          {readOnly
            ? "No interview rounds added"
            : "Add each round of interviews you had for this role"}
        </FieldHint>
      )}
      {fields.map((field, index) => (
        <InterviewRoundItem
          key={field.id}
          index={index}
          onRemove={() => remove(index)}
        />
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={() =>
            append({
              interviewType: undefined,
              interviewDifficulty: undefined,
            })
          }
          className="self-start text-sm font-semibold text-cooper-gray-400 hover:text-cooper-gray-900"
        >
          + Add interview round
        </button>
      )}
    </FormSection>
  );
}
