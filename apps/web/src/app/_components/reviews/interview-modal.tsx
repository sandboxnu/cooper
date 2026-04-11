"use client";

import React, { useState } from "react";
import { ArrowUp } from "lucide-react";

import { prettyIndustry } from "~/utils/stringHelpers";
import ModalContainer from "./modal";

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
  compact?: boolean;
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
        <p className="text-lg text-cooper-gray-900">{label}</p>
        {dominantDifficulty && (
          <div className="flex items-center gap-2 text-sm text-cooper-gray-400">
            {difficultyLabel(dominantDifficulty)}
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-2.5">
        <div className="flex gap-0.5">
          {Array.from({ length: totalReviewsWithRounds }).map((_, i) => (
            <div
              key={i}
              className={`h-9 w-6 shrink-0 rounded-lg ${i < reviewCount ? "bg-[#9d9c56]" : "bg-[#d3d3d3]"}`}
            />
          ))}
        </div>
        <p className="text-sm leading-[normal] text-cooper-gray-350">
          {reviewCount}/{totalReviewsWithRounds} reported
        </p>
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

function difficultyLabel(d: Difficulty | null): React.ReactNode {
  if (d === "easy")
    return (
      <span className="flex items-center gap-2">
        <ArrowUp size={9} className="rotate-180" />
        <span>Less difficult</span>
      </span>
    );
  if (d === "average") return "Average difficulty";
  if (d === "hard")
    return (
      <span className="flex items-center gap-2">
        <ArrowUp size={9} />
        <span>More difficult</span>
      </span>
    );
  return null;
}

interface InfoIconProps {
  tooltip: React.ReactNode;
}

function InfoIcon({ tooltip }: InfoIconProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-[#989898] text-xs font-semibold text-[#989898]"
        aria-label="More info"
        type="button"
      >
        i
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-60 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white">
          {tooltip}
        </span>
      )}
    </span>
  );
}

interface SingleInterviewTypeCardProps {
  typeKey: string;
  reviewCount: number;
  totalReviewsWithRounds: number;
  dominantDifficulty: Difficulty | null;
}

function SingleInterviewTypeCard({
  typeKey,
  reviewCount,
  totalReviewsWithRounds,
  dominantDifficulty,
}: SingleInterviewTypeCardProps) {
  const label = TYPE_LABELS[typeKey] ?? typeKey;
  // Use fixed w-6 (24px) per bar until they'd overflow 172px, then flex-1
  const useFixedWidth = totalReviewsWithRounds * 24 <= 172;

  return (
    <div className="flex w-40 flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-0.5">
          <p className="text-md = text-cooper-gray-900">{label}</p>
          <p className="h-5 overflow-hidden text-sm leading-[normal] text-cooper-gray-350">
            {reviewCount}/{totalReviewsWithRounds} reported{" "}
            {label.toLowerCase()} interviews
          </p>
        </div>
        {/* Bar row: green bars first, then gray */}
        <div className="flex gap-0.5">
          {Array.from({ length: totalReviewsWithRounds }).map((_, i) => (
            <div
              key={i}
              className={`h-9 rounded-lg ${i < reviewCount ? "bg-[#9d9c56]" : "bg-[#d3d3d3]"} ${useFixedWidth ? "w-6 shrink-0" : "flex-1"}`}
            />
          ))}
        </div>
      </div>
      {dominantDifficulty && (
        <div className="flex items-center gap-2 text-sm text-cooper-gray-400">
          {difficultyLabel(dominantDifficulty)}
        </div>
      )}
    </div>
  );
}

export function InterviewModal({
  roleData,
  industryData,
  compact = false,
}: InterviewModalProps) {
  const [activeTab, setActiveTab] = useState<"total" | "industry">("total");

  const totalReviewsWithRounds = roleData?.totalReviewsWithRounds ?? 0;

  // Big number: always from roleData (mode of this role's responses)
  const roundsModeDisplay =
    roleData?.roundsMode != null
      ? `${roleData.roundsMode} ${roleData.roundsMode === 1 ? "round" : "rounds"}`
      : "---";

  // Bar chart source: Total tab uses role data (fallback to industry when no role data)
  const activeBarData: RoundsDist[] =
    activeTab === "total" && totalReviewsWithRounds > 0
      ? (roleData?.roundsDistribution ?? [])
      : (industryData?.roundsDistribution ?? []);

  // Mode bar highlight: role mode for Total tab, industry mode for Industry tab
  const activeMode =
    activeTab === "total" ? roleData?.roundsMode : industryData?.roundsMode;

  // Cooper average label
  const industryName = roleData?.industryName ?? null;
  const prettyIndustryName = industryName ? prettyIndustry(industryName) : null;
  const cooperAverageRounds = industryData?.roundsMode;

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
              <div className="flex h-6 items-center justify-center gap-1.5 rounded-lg bg-white px-2">
                <span className="text-sm text-cooper-gray-400">
                  {roleData?.overallDominantDifficulty != null
                    ? difficultyText(roleData.overallDominantDifficulty)
                    : "No difficulty data"}
                </span>
              </div>
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
                {/* Tab toggle */}
                <div className="flex items-center gap-1.5">
                  {(["total", "industry"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex cursor-pointer items-center justify-center rounded-lgborder border-black/[0.06] px-2 py-1 text-sm text-[rgba(0,0,0,0.7)] ${
                        activeTab === tab ? "bg-[#ebebeb]" : "bg-white"
                      }`}
                    >
                      {tab === "total" ? "Total" : "Industry"}
                    </button>
                  ))}
                </div>

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
                            <div className="flex items-center justify-center pl-1 text-sm leading-5 text-black opacity-50">
                              {showLabel ? `${bar.rounds} rounds` : bar.rounds}
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
          <div className="w-px self-stretch border-l border-[#ebebeb]" />

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
                  <div className="flex h-6 items-center justify-center gap-1.5 rounded-lg bg-white px-2">
                    <span className="text-sm text-cooper-gray-400">
                      {roleData?.overallDominantDifficulty != null
                        ? difficultyText(roleData.overallDominantDifficulty)
                        : "No difficulty data"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-4 leading-6 text-cooper-gray-900">
                Most common interview{" "}
                {universalTypes.split(", ").length === 1 ? "type" : "types"}
              </p>
            </div>

            {/* Types grid */}
            {totalReviewsWithRounds > 0 ? (
              <div className="flex flex-wrap content-start gap-x-9 gap-y-5">
                {roleData?.types.map((t) => (
                  <SingleInterviewTypeCard
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

        {/* Footer */}
        <p className="text-3 leading-3 text-cooper-gray-350">
          {totalReviewsWithRounds > 0
            ? `Based on ${totalReviewsWithRounds} response${totalReviewsWithRounds === 1 ? "" : "s"}`
            : "No responses"}
        </p>
      </div>
    </ModalContainer>
  );
}
