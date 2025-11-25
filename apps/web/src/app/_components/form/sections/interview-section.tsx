"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { Input } from "@cooper/ui/input";

import { FormSection } from "~/app/_components/form/form-section";
import { Plus, X } from "lucide-react";
import { Rating } from "../rating";

type InterviewType = 'Behavioral' | 'Technical' | 'Case study' | 'Portfolio walkthrough' | 'Online assessment';
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
    'Behavioral',
    'Technical',
    'Case study',
    'Portfolio walkthrough',
    'Online assessment'
  ];

  const [rounds, setRounds] = useState<Round[]>([
    {
      id: '1',
      selectedTypes: ['Behavioral', 'Technical'],
      difficulty: 5,
      cooperAverage: 3.2
    },
    {
      id: '2',
      selectedTypes: ['Portfolio walkthrough', 'Online assessment'],
      difficulty: 4,
      cooperAverage: 4.5
    }
  ]);

  const toggleInterviewType = (roundId: string, type: InterviewType) => {
    setRounds(rounds.map(round => {
      if (round.id === roundId) {
        const types = round.selectedTypes.includes(type)
          ? round.selectedTypes.filter(t => t !== type)
          : [...round.selectedTypes, type];
        return { ...round, selectedTypes: types };
      }
      return round;
    }));
  };

  const updateDifficulty = (roundId: string, difficulty: number) => {
    setRounds(rounds.map(round =>
      round.id === roundId ? { ...round, difficulty } : round
    ));
  };

  const removeRound = (roundId: string) => {
    setRounds(rounds.filter(round => round.id !== roundId));
  };

  const addRound = () => {
    const newId = String(Math.max(...rounds.map(r => parseInt(r.id)), 0) + 1);
    setRounds([...rounds, {
      id: newId,
      selectedTypes: [],
      difficulty: 3,
      cooperAverage: 0
    }]);
  };

  return (

    <FormSection>
      <div className="flex flex-row">
      <div>
        <p>Interview rounds</p>
        <div>
        Enter details for your interview rounds.
        </div>
        </div>
        <div className="w-full max-w-4xl mx-auto p-6 bg-white">
      <div className="space-y-4">
        {rounds.map((round, index) => (
          <div key={round.id} className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Round {index + 1}</h2>
              <button
                onClick={() => removeRound(round.id)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left side - Interview type */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-gray-800">Interview type</h3>
                  <span className="text-gray-400 text-sm">?</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERVIEW_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleInterviewType(round.id, type)}
                      className={`px-4 py-2 rounded-2xl border-2 font-medium transition-all ${
                        round.selectedTypes.includes(type)
                          ? 'border-current bg-opacity-20'
                          : 'border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                      style={
                        round.selectedTypes.includes(type)
                          ? {
                              borderColor: type === 'Behavioral' ? '#F68DCC' : type === 'Technical' ? '#99B449' : type === 'Case study' ? '#f3f4f6' : type === 'Portfolio walkthrough' ? '#8B68BA' : '#6A7C90',
                              backgroundColor: type === 'Behavioral' ? '#FFF0F9' : type === 'Technical' ? '#F7FDCD' : type === 'Case study' ? '#f9fafb' : type === 'Portfolio walkthrough' ? '#F8E9FF' : '#D9F0FF',
                              color: type === 'Behavioral' ? '#F68DCC' : type === 'Technical' ? '#99B449' : type === 'Case study' ? '#6b7280' : type === 'Portfolio walkthrough' ? '#8B68BA' : '#6A7C90'
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
                <h3 className="font-semibold text-gray-800 mb-2">Difficulty</h3>
                <p className="text-gray-500 text-sm mb-3">Rate the difficulty of this round</p>
                <Rating />
                <p className="text-gray-500 text-sm">
                  Cooper average for first round: {round.cooperAverage.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add interview round button */}
      <button
        onClick={addRound}
        className="w-full mt-4 py-3 rounded-lg bg-[#FFE4B3] hover:bg-[#FFE4B3] transition-colors font-semibold text-[#FFA400] flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add interview round
      </button>
    </div>
    </div>
    </FormSection>
  );
}
