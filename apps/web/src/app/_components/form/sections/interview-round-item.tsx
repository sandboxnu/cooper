"use client";

import { X } from "lucide-react";

import { useReadOnly } from "@cooper/ui/read-only";

import { FieldRow, SelectField } from "~/app/_components/form/fields";

interface InterviewRoundItemProps {
  index: number;
  onRemove: () => void;
}

export function InterviewRoundItem({
  index,
  onRemove,
}: InterviewRoundItemProps) {
  const readOnly = useReadOnly();

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-cooper-gray-150 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-cooper-gray-550">
          Round {index + 1}
        </p>
        {!readOnly && (
          <button
            type="button"
            aria-label={`Remove round ${index + 1}`}
            onClick={onRemove}
            className="rounded-full p-1 text-cooper-gray-400 hover:bg-[#F6F6F6]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <FieldRow>
        <SelectField
          name={`interviewRounds.${index}.interviewType`}
          label="Interview type"
          required
          options={[
            { id: "behavioral", label: "Behavioral" },
            { id: "technical", label: "Technical" },
            { id: "case_study", label: "Case study" },
            { id: "portfolio_walkthrough", label: "Portfolio walkthrough" },
            { id: "online_assessment", label: "Online assessment" },
            { id: "screening", label: "Screening" },
            { id: "other", label: "Other" },
          ]}
        />
        <SelectField
          name={`interviewRounds.${index}.interviewDifficulty`}
          label="Difficulty"
          required
          options={[
            { id: "easy", label: "Easier than other interviews" },
            { id: "average", label: "About the same as other interviews" },
            { id: "hard", label: "Harder than other interviews" },
          ]}
        />
      </FieldRow>
    </div>
  );
}
