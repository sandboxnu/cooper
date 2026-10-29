"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

import { cn } from "@cooper/ui";

import { prettyIndustry } from "~/utils/stringHelpers";
import type { CompareSize } from "../../compare/compare-context";
import {
  CompareSection,
  CompareSectionTitle,
} from "../../compare/compare-section";
import ModalContainer from "../../reviews/modal";
import { DotBar, DotCount } from "./shared/dot-statement";
import { PipCard } from "./shared/pip-card";
import { InfoIcon } from "./shared/info-icon";
import { TabToggle } from "./shared/tab-toggle";

const TYPE_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Technical",
  case_study: "Case study",
  portfolio_walkthrough: "Portfolio walkthrough",
  online_assessment: "Online assessment",
  screening: "Screening",
  other: "Other",
};

type Difficulty = "easy" | "average" | "hard";

interface RoundsDist {
  rounds: number;
  count: number;
}

interface InterviewType {
  type: string;
  reviewCount: number;
  dominantDifficulty: Difficulty | null;
}

interface RoleData {
  totalReviewsWithRounds: number;
  roundsMode: number | null;
  roundsDistribution: RoundsDist[];
  types: InterviewType[];
  overallDominantDifficulty: Difficulty | null;
  industryName: string | null;
}

interface IndustryData {
  roundsMode: number | null;
  roundsDistribution: RoundsDist[];
}

interface InterviewModalProps {
  roleData: RoleData | undefined;
  industryData: IndustryData | undefined;
  globalData: IndustryData | undefined;
  compact?: boolean;
  compareSize?: CompareSize;
}

interface CompactTypeRowProps {
  typeKey: string;
  reviewCount: number;
  totalReviewsWithRounds: number;
  dominantDifficulty: Difficulty | null;
}

function CompactTypeRow({
  typeKey,
  reviewCount,
  totalReviewsWithRounds,
  dominantDifficulty,
}: CompactTypeRowProps) {
  const label = TYPE_LABELS[typeKey] ?? typeKey;
  return (
    <div className="flex items-start justify-between">
      <div className="flex flex-col gap-0.5">
        <p className="text-[16px] tracking-[-0.16px] text-cooper-gray-900">
          {label}
        </p>
        {dominantDifficulty && (
          <DifficultyChip difficulty={dominantDifficulty} />
        )}
      </div>
      <div className="flex flex-col items-start gap-2.5">
        <DotBar
          className="max-w-[102px]"
          filledCount={reviewCount}
          totalCount={totalReviewsWithRounds}
          filledColor="#9d9c56"
        />
        <DotCount
          count={reviewCount}
          total={totalReviewsWithRounds}
          label="reported"
          color="#9d9c56"
        />
      </div>
    </div>
  );
}

function difficultyText(d: Difficulty | null): string {
  if (d === "easy") return "Less difficult";
  if (d === "average") return "Average difficulty";
  if (d === "hard") return "More difficult";
  return "";
}

function DifficultyChip({ difficulty }: { difficulty: Difficulty | null }) {
  return (
    <div className="flex h-[25px] items-center justify-center gap-1 rounded-lg bg-[#eee] px-[7px] text-cooper-gray-400">
      {difficulty === "easy" && <ArrowUp size={12} className="rotate-180" />}
      {difficulty === "hard" && <ArrowUp size={12} />}
      <p className="text-[14px] leading-normal">
        {difficulty != null ? difficultyText(difficulty) : "No difficulty data"}
      </p>
    </div>
  );
}

export function InterviewModal({
  roleData,
  industryData,
  globalData,
  compact = false,
  compareSize,
}: InterviewModalProps) {
  const [activeTab, setActiveTab] = useState<"total" | "industry">("total");

  const totalReviewsWithRounds = roleData?.totalReviewsWithRounds ?? 0;

  // Big number: always from roleData (mode of this role's responses)
  const roundsModeDisplay =
    roleData?.roundsMode != null
      ? `${roleData.roundsMode} ${roleData.roundsMode === 1 ? "round" : "rounds"}`
      : "---";

  // Bar chart source: Total tab uses global data, Industry tab uses industry data
  const activeBarData: RoundsDist[] =
    activeTab === "total"
      ? (globalData?.roundsDistribution ?? [])
      : (industryData?.roundsDistribution ?? []);

  // Mode bar highlight: global mode for Total tab, industry mode for Industry tab
  const activeMode =
    activeTab === "total" ? globalData?.roundsMode : industryData?.roundsMode;

  // Cooper average label
  const industryName = roleData?.industryName ?? null;
  const prettyIndustryName = industryName ? prettyIndustry(industryName) : null;
  const cooperAverageRounds =
    activeTab === "total" ? globalData?.roundsMode : industryData?.roundsMode;

  // Types headline: types reported by everyone
  const maxTypeCount = roleData?.types.length
    ? Math.max(...roleData.types.map((t) => t.reviewCount))
    : 0;
  const universalTypes =
    totalReviewsWithRounds > 0 && maxTypeCount > 0
      ? (roleData?.types
          .filter((t) => t.reviewCount === maxTypeCount)
          .map((t) => TYPE_LABELS[t.type] ?? t.type)
          .join(", ") ?? "---")
      : "---";

  // Rounds tooltip
  const roundsTooltipContent =
    totalReviewsWithRounds > 0 && roleData?.roundsDistribution.length
      ? roleData.roundsDistribution
          .map(
            ({ rounds, count }) =>
              `${count} ${count === 1 ? "person" : "people"} reported ${rounds} round${rounds === 1 ? "" : "s"}`,
          )
          .join(". ") + "."
      : "No data";

  // Types tooltip
  const typesTooltip =
    totalReviewsWithRounds > 0 && prettyIndustryName
      ? `Compared to other interviews for ${prettyIndustryName} jobs`
      : "No data";

  // Bar label: show "X rounds" if bar is wide enough, else just "X"
  // Approximate: bar width ≈ (count / totalCount) * 324px; show label if ≥ 40px
  const totalBarCount = activeBarData.reduce((s, b) => s + b.count, 0);

  if (compareSize) {
    const isSmall = compareSize === "sm";
    return (
      // One child per grid row; see COMPARE_ROWS.interview
      <CompareSection
        section="interview"
        className={cn(isSmall && "px-5 py-4")}
      >
        <div>
          <CompareSectionTitle>Interview</CompareSectionTitle>
          <div className="flex items-end gap-3">
            <p
              className={cn(
                "text-[36px] leading-normal text-cooper-gray-900",
                isSmall && "tracking-[-0.72px]",
              )}
            >
              {roundsModeDisplay}
            </p>
            {/* pb sets the circle's bottom on the text baseline (36px, leading-normal) */}
            <div className="flex items-center pb-[13px]">
              <InfoIcon tooltip={roundsTooltipContent} />
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-[7px] border-t border-cooper-gray-125 pt-5">
          <p className="text-[36px] leading-normal tracking-[-0.72px] text-cooper-gray-900">
            {universalTypes}
          </p>
          <div className="flex items-center gap-2.5">
            <DifficultyChip
              difficulty={roleData?.overallDominantDifficulty ?? null}
            />
            <InfoIcon tooltip={typesTooltip} />
          </div>
        </div>
      </CompareSection>
    );
  }

  if (compact) {
    return (
      <ModalContainer title="Interview">
        <div className="flex flex-col gap-6">
          <p className="text-4xl font-normal leading-[normal] text-cooper-gray-900">
            {roundsModeDisplay}
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <p className="text-lg font-bold leading-6 text-cooper-gray-900">
                Interview Types
              </p>
              <DifficultyChip
                difficulty={roleData?.overallDominantDifficulty ?? null}
              />
            </div>
            {totalReviewsWithRounds > 0 && roleData?.types.length ? (
              <div className="flex flex-col gap-5">
                {roleData.types.map((t) => (
                  <CompactTypeRow
                    key={t.type}
                    typeKey={t.type}
                    reviewCount={t.reviewCount}
                    totalReviewsWithRounds={totalReviewsWithRounds}
                    dominantDifficulty={t.dominantDifficulty}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-cooper-gray-400">
                No interview type data
              </p>
            )}
          </div>
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer title="Interview">
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-8">
          {/* Left — Rounds panel */}
          <div className="flex shrink-0 flex-col gap-2 overflow-clip">
            <div className="flex flex-col gap-5">
              {/* Big number + label */}
              <div className="flex w-full flex-col">
                <p className="text-4xl font-normal leading-[normal] text-cooper-gray-900">
                  {roundsModeDisplay}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-md leading-6 text-cooper-gray-900">
                    Number of rounds
                  </span>
                  <InfoIcon tooltip={roundsTooltipContent} />
                </div>
              </div>

              {/* Bar chart section */}
              <div className="flex w-80 flex-col gap-4">
                <TabToggle activeTab={activeTab} onChange={setActiveTab} />

                <div className="flex flex-col gap-2">
                  {/* Cooper average dot + label */}
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 shrink-0 rounded-full bg-[#d37bae]" />
                    <span className="whitespace-nowrap text-sm text-cooper-gray-400">
                      Cooper average
                      {activeTab === "industry" && prettyIndustryName
                        ? ` for ${prettyIndustryName} jobs`
                        : ""}
                      {": "}
                      {cooperAverageRounds != null ? (
                        <>
                          {cooperAverageRounds}{" "}
                          <strong>
                            {cooperAverageRounds === 1 ? "round" : "rounds"}
                          </strong>
                        </>
                      ) : (
                        "--"
                      )}
                    </span>
                  </div>

                  {/* Bar chart */}
                  {activeBarData.length > 0 ? (
                    <div className="flex w-full items-end gap-px">
                      {activeBarData.map((bar) => {
                        const approxWidth =
                          totalBarCount > 0
                            ? (bar.count / totalBarCount) * 324
                            : 0;
                        const showLabel = approxWidth >= 40;
                        return (
                          <div
                            key={bar.rounds}
                            className="flex flex-col gap-1.5"
                            style={{ flexGrow: bar.count }}
                          >
                            <div
                              className={`h-9 min-w-4 w-full rounded-lg ${
                                bar.rounds === activeMode
                                  ? "bg-[#d37bae]"
                                  : "bg-[#e7c7da]"
                              }`}
                            />
                            <div className="flex items-center justify-start pl-1 text-sm leading-5 text-black opacity-50">
                              {showLabel
                                ? `${bar.rounds} ${bar.rounds === 1 ? "round" : "rounds"}`
                                : bar.rounds}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch border-l border-cooper-gray-125" />

          {/* Right — Types panel */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* Header: headline + info + difficulty chip */}
            <div className="flex flex-col">
              <div className="flex w-full items-start justify-between">
                <p className="text-4xl font-normal leading-[normal] text-cooper-gray-900">
                  {universalTypes}
                </p>
                <div className="flex shrink-0 items-center gap-2.5">
                  <InfoIcon tooltip={typesTooltip} />
                  <DifficultyChip
                    difficulty={roleData?.overallDominantDifficulty ?? null}
                  />
                </div>
              </div>
              <p className="text-base leading-6 text-cooper-gray-900">
                Most common interview{" "}
                {universalTypes.split(", ").length === 1 ? "type" : "types"}
              </p>
            </div>

            {/* Types grid */}
            {totalReviewsWithRounds > 0 ? (
              <div className="flex flex-wrap content-start gap-x-9 gap-y-5">
                {roleData?.types.map((t) => (
                  <PipCard
                    key={t.type}
                    name={TYPE_LABELS[t.type] ?? t.type}
                    countLabel={`reported ${(TYPE_LABELS[t.type] ?? t.type).toLowerCase()} interviews`}
                    filledCount={t.reviewCount}
                    totalCount={totalReviewsWithRounds}
                    filledColor="#9d9c56"
                    footer={
                      t.dominantDifficulty && (
                        <DifficultyChip difficulty={t.dominantDifficulty} />
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-cooper-gray-400">
                No interview type data
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[12px] leading-[14px] tracking-[-0.12px] text-cooper-gray-350">
          {totalReviewsWithRounds > 0
            ? `Based on ${totalReviewsWithRounds} response${totalReviewsWithRounds === 1 ? "" : "s"}`
            : "No responses"}
        </p>
      </div>
    </ModalContainer>
  );
}
