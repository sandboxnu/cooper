"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { FormSection } from "~/app/_components/form/form-section";
import { Plus, X } from "lucide-react";
import { Rating } from "../rating";

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
  const form = useFormContext();

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

  const updateDifficulty = (roundId: string, difficulty: number) => {
    setRounds(
      rounds.map((round) =>
        round.id === roundId ? { ...round, difficulty } : round,
      ),
    );
  };

  const removeRound = (roundId: string) => {
    setRounds(rounds.filter((round) => round.id !== roundId));
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

  return (
    <FormSection>
      <div className="flex flex-col md:flex-row">
        <div className="pl-6 md:pl-16 pt-6 md:pt-8">
          <div className="text-sm font-medium">Interview rounds</div>
          <div className="text-cooper-gray-450 text-xs">
            Enter details for your interview rounds.
          </div>
        </div>
        <div className="w-full md:max-w-4xl mx-auto p-6 bg-white">
          <div className="space-y-4">
            {rounds.map((round, index) => (
              <div
                key={round.id}
                className="border border-gray-200 rounded-lg pt-3 pr-5 pl-5 pb-5 bg-white"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-md font-medium text-cooper-gray-400">
                    Round {index + 1}
                  </h2>
                  <button
                    onClick={() => removeRound(round.id)}
                    className=" hover:bg-gray-100 rounded"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left side - Interview type */}
                  <div className="border-r">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-bold text-cooper-gray-400 text-md">
                        Interview type
                      </h3>
                      <div className="text-cooper-gray-450 text-sm bg-cooper-gray-150 px-1 pt-0.25 rounded-lg">
                        ?
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INTERVIEW_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleInterviewType(round.id, type)}
                          className={`px-4 py-1 rounded-2xl border-2 font-medium text-xs transition-all ${
                            round.selectedTypes.includes(type)
                              ? "border-current bg-opacity-20"
                              : "border-cooper-gray-150 text-cooper-gray-350 "
                          }`}
                          style={
                            round.selectedTypes.includes(type)
                              ? {
                                  borderColor:
                                    type === "Behavioral"
                                      ? "#F68DCC"
                                      : type === "Technical"
                                        ? "#99B449"
                                        : type === "Case study"
                                          ? "#f3f4f6"
                                          : type === "Portfolio walkthrough"
                                            ? "#8B68BA"
                                            : "#6A7C90",
                                  backgroundColor:
                                    type === "Behavioral"
                                      ? "#FFF0F9"
                                      : type === "Technical"
                                        ? "#F7FDCD"
                                        : type === "Case study"
                                          ? "#f9fafb"
                                          : type === "Portfolio walkthrough"
                                            ? "#F8E9FF"
                                            : "#D9F0FF",
                                  color:
                                    type === "Behavioral"
                                      ? "#F68DCC"
                                      : type === "Technical"
                                        ? "#99B449"
                                        : type === "Case study"
                                          ? "#6b7280"
                                          : type === "Portfolio walkthrough"
                                            ? "#8B68BA"
                                            : "#6A7C90",
                                }
                              : {}
                          }
                        >
                          {round.selectedTypes.includes(type) && (
                            <span className="mr-1">✓</span>
                          )}
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right side - Difficulty */}
                  <div>
                    <h3 className="font-bold text-md text-cooper-gray-400 mb-0.5">
                      Difficulty
                    </h3>
                    <p className="text-cooper-gray-350 text-xs mb-3">
                      Rate the difficulty of this round
                    </p>
                    <Rating />
                    <p className="text-cooper-gray-350 text-xs">
                      Cooper average for first round:{" "}
                      {round.cooperAverage.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add interview round button */}
          <button
            onClick={addRound}
            className="w-full mt-2 py-2 rounded-b-lg bg-[#FFE4B3] hover:bg-[#FFE4B3] transition-colors font-bold text-[#FFA400] flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add interview round
          </button>
        </div>
      </div>
    </FormSection>
  );
}
