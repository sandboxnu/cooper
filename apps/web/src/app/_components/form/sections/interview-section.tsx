"use client";

import { FormSection } from "~/app/_components/form/form-section";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "node_modules/@cooper/ui/src/form";
import { Select } from "../../themed/onboarding/select";
import { useFormContext } from "react-hook-form";

// type InterviewType =
//   | "Behavioral"
//   | "Technical"
//   | "Case study"
//   | "Portfolio walkthrough"
//   | "Online assessment";
// interface Round {
//   id: string;
//   selectedTypes: InterviewType[];
//   difficulty: number;
//   cooperAverage: number;
// }

/**
 * InterviewSection component.
 */
export function InterviewSection() {
  // const [rounds, setRounds] = useState<Round[]>([
  //   {
  //     id: "1",
  //     selectedTypes: ["Behavioral", "Technical"],
  //     difficulty: 5,
  //     cooperAverage: 3.2,
  //   },
  //   {
  //     id: "2",
  //     selectedTypes: ["Portfolio walkthrough", "Online assessment"],
  //     difficulty: 4,
  //     cooperAverage: 4.5,
  //   },
  // ]);

  // const addRound = () => {
  //   const newId = String(Math.max(...rounds.map((r) => parseInt(r.id)), 0) + 1);
  //   setRounds([
  //     ...rounds,
  //     {
  //       id: newId,
  //       selectedTypes: [],
  //       difficulty: 3,
  //       cooperAverage: 0,
  //     },
  //   ]);
  // };
  const form = useFormContext();

  return (
    <FormSection>
      <FormField
        control={form.control}
        name="interviewDifficulty"
        render={({ field }) => (
          <FormItem className="flex flex-col w-full">
            <FormLabel className="text-sm font-bold text-cooper-gray-400">
              Interview difficulty<span className="text-[#FB7373]">*</span>
            </FormLabel>
            <FormControl className="relative w-full">
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
                    e.target.value === "" ? undefined : e.target.value;
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* <div className="w-full pt-3">
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div key={round.id} className="flex flex-row gap-7 w-full">
              <div className="text-md font-bold text-cooper-gray-550 flex-shrink-0">
                Round {index + 1}
              </div>

              <div className="grid grid-cols-2 gap-5 flex-1 w-full">
                <FormField
                  control={form.control}
                  name="round"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                        Interview type
                      </FormLabel>
                      <FormControl className="relative w-full">
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
                    <FormItem className="flex flex-col w-full">
                      <FormLabel className="text-sm font-semibold text-cooper-gray-400">
                        Difficulty
                      </FormLabel>
                      <FormControl className="relative w-full">
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

        <button
          onClick={addRound}
          className="w-full mt-2 py-2 transition-colors font-bold text-cooper-gray-350 flex items-center gap-2 pl-20"
        >
          <Plus className="w-5 h-5" />
          Add interview round
        </button>
      </div> */}
    </FormSection>
  );
}
