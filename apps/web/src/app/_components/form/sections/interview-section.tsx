"use client";

import { useState } from "react";

import { FormSection } from "~/app/_components/form/form-section";
import { Plus } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "node_modules/@cooper/ui/src/form";
import { Select } from "../../themed/onboarding/select";
import { useFormContext } from "react-hook-form";

type InterviewType =
  | "Behavioral"
  | "Technical"
  | "Case study"
  | "Portfolio walkthrough"
  | "Online assessment";
interface Round {
  id: string;
  selectedTypes: InterviewType[];
  difficulty: number;
  cooperAverage: number;
}

/**
 * InterviewSection component.
 */
export function InterviewSection() {
  const INTERVIEW_TYPES: InterviewType[] = [
    "Behavioral",
    "Technical",
    "Case study",
    "Portfolio walkthrough",
    "Online assessment",
  ];

  const [rounds, setRounds] = useState<Round[]>([
    {
      id: "1",
      selectedTypes: ["Behavioral", "Technical"],
      difficulty: 5,
      cooperAverage: 3.2,
    },
    {
      id: "2",
      selectedTypes: ["Portfolio walkthrough", "Online assessment"],
      difficulty: 4,
      cooperAverage: 4.5,
    },
  ]);

  const toggleInterviewType = (roundId: string, type: InterviewType) => {
    setRounds(
      rounds.map((round) => {
        if (round.id === roundId) {
          const types = round.selectedTypes.includes(type)
            ? round.selectedTypes.filter((t) => t !== type)
            : [...round.selectedTypes, type];
          return { ...round, selectedTypes: types };
        }
        return round;
      }),
    );
  };

  const addRound = () => {
    const newId = String(Math.max(...rounds.map((r) => parseInt(r.id)), 0) + 1);
    setRounds([
      ...rounds,
      {
        id: newId,
        selectedTypes: [],
        difficulty: 3,
        cooperAverage: 0,
      },
    ]);
  };
  const form = useFormContext();

  return (
    <FormSection>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:max-w-4xl mx-auto">
          <div className="space-y-4">
            {rounds.map((round, index) => (
              <div key={round.id}>
                <div className="text-md font-medium text-cooper-gray-400">
                  Round {index + 1}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left side - Interview type */}
                  <FormField
                    control={form.control}
                    name="round"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                          Interview type
                        </FormLabel>
                        <FormControl className="relative flex-1">
                          <Select
                            onClear={() => field.onChange(undefined)}
                            options={[
                              { value: "Behavioral", label: "Behavioral" },
                              { value: "Technical", label: "Technical" },
                              { value: "Case study", label: "Case study" },
                              {
                                value: "Portfolio walkthrough",
                                label: "Portfolio walkthrough",
                              },
                              {
                                value: "Online assessment",
                                label: "Online assessment",
                              },
                            ]}
                            className="w-full border-cooper-gray-150 text-sm h-10"
                            value={field.value ?? ""}
                            placeholder="Select"
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? undefined
                                  : e.target.value;
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
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                          Difficulty
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
                            value={field.value ?? ""}
                            placeholder="Select"
                            onChange={(e) => {
                              const value =
                                e.target.value === ""
                                  ? undefined
                                  : e.target.value;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add interview round button */}
          <button
            onClick={addRound}
            className="w-full mt-2 py-2 transition-colors font-bold text-cooper-gray-450 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add interview round
          </button>
        </div>
      </div>
    </FormSection>
  );
}
