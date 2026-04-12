"use client";

import ModalContainer from "../../reviews/modal";
import { InfoIcon } from "./shared/info-icon";

interface AveragesData {
  averageCultureRating: number;
  averageSupervisorRating: number;
  federalHolidays: number;
  drugTest: number;
  freeLunch: number;
  freeMerch: number;
  travelBenefits: number;
  snackBar: number;
  pto: number;
  totalReviews: number;
  workEnvironmentMode: string | null;
  workEnvironmentAlerts: string[];
  jobLengthMin: number | null;
  jobLengthMax: number | null;
  workHoursMin: number | null;
  workHoursMax: number | null;
  overtimeCount: number;
  accessibleByTransportation: number;
  teamOutingsCount: number;
  coffeeChatCount: number;
  constructiveFeedbackCount: number;
  onboarding: number;
  workStructure: number;
  careerGrowth: number;
  tools: string[];
}

interface OnTheJobModalProps {
  averages: AveragesData;
  isComparing: boolean;
}

const BENEFIT_LABELS: { key: keyof AveragesData; label: string }[] = [
  { key: "freeMerch", label: "free merch" },
  { key: "freeLunch", label: "lunch provided" },
  { key: "snackBar", label: "snack bar" },
  { key: "travelBenefits", label: "travel benefits" },
];

function SupportBar({ pct, hasData }: { pct: number; hasData: boolean }) {
  const filledSegments = hasData ? Math.floor(pct * 10) : 0;
  const partialFill = hasData ? (pct * 10) % 1 : 0;
  const hasPartial = hasData && partialFill > 0;

  return (
    <div className="flex h-9 w-[102px] gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => {
        if (i < filledSegments) {
          return (
            <div
              key={i}
              className="h-full flex-[1_0_0] rounded-lg bg-[#92c6cd]"
            />
          );
        }
        if (i === filledSegments && hasPartial) {
          return (
            <div
              key={i}
              className="relative h-full flex-[1_0_0] overflow-hidden rounded-lg bg-[#cbcbcb]"
            >
              <div
                className="absolute left-0 top-0 h-full bg-[#92c6cd]"
                style={{ width: `${partialFill * 100}%` }}
              />
            </div>
          );
        }
        return (
          <div
            key={i}
            className="h-full flex-[1_0_0] rounded-lg bg-[#cbcbcb]"
          />
        );
      })}
    </div>
  );
}

function BenefitRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-10 items-start">
      <p className="w-[120px] shrink-0 text-cooper-gray-400 text-[16px] leading-6 tracking-[-0.16px]">
        {label}
      </p>
      <div className="flex flex-1 flex-col min-w-0">{children}</div>
    </div>
  );
}

export function OnTheJobModal({ averages, isComparing }: OnTheJobModalProps) {
  const {
    totalReviews,
    workEnvironmentMode,
    workEnvironmentAlerts,
    jobLengthMin,
    jobLengthMax,
    workHoursMin,
    workHoursMax,
    overtimeCount,
    accessibleByTransportation,
    drugTest,
    teamOutingsCount,
    coffeeChatCount,
    constructiveFeedbackCount,
    onboarding,
    workStructure,
    careerGrowth,
    tools,
  } = averages;

  const hasData = totalReviews > 0;

  // Job length display
  let jobLengthDisplay = "---";
  if (jobLengthMin !== null && jobLengthMax !== null) {
    jobLengthDisplay =
      jobLengthMin === jobLengthMax
        ? `${jobLengthMin} ${jobLengthMin === 1 ? "month" : "months"}`
        : `${jobLengthMin}-${jobLengthMax} months`;
  }

  // Work hours
  let workHoursDisplay = "No data";
  if (workHoursMin !== null && workHoursMax !== null) {
    workHoursDisplay =
      workHoursMin === workHoursMax
        ? `${workHoursMin} hours per week`
        : `${workHoursMin}-${workHoursMax} hours per week`;
  }
  const overtimeLabel =
    overtimeCount > totalReviews / 2
      ? "Overtime work common"
      : "No overtime reported";

  // Transportation
  let transportDisplay = "No data";
  if (hasData) {
    if (accessibleByTransportation > 0.5)
      transportDisplay = "Accessible by transportation";
    else if (accessibleByTransportation < 0.5)
      transportDisplay = "Not accessible by transportation";
  }

  // Drug test
  let drugTestDisplay = "No data";
  if (hasData) {
    if (drugTest > 0.5) drugTestDisplay = "Required";
    else if (drugTest < 0.5) drugTestDisplay = "Not required";
  }

  // Benefits
  const activeBenefits = BENEFIT_LABELS.filter(
    ({ key }) => (averages[key] as number) > 0,
  ).map(({ label }) => label);
  const benefitsDisplay = hasData
    ? activeBenefits.length > 0
      ? activeBenefits
          .map((b, i) => (i === 0 ? b.charAt(0).toUpperCase() + b.slice(1) : b))
          .join(", ")
      : "No benefits reported"
    : "No data";

  // Tools
  const toolsDisplay = tools.length > 0 ? tools.join(", ") : "No data";

  const cultureRows = [
    { label: "Team outings", count: teamOutingsCount },
    { label: "Coffee chat culture", count: coffeeChatCount },
    { label: "Feedback", count: constructiveFeedbackCount },
  ];

  const supportRows = [
    {
      label: "Onboarding",
      subtext:
        "I was properly onboarded into the company and role, with prompt communication before my first day.",
      pct: onboarding,
    },
    {
      label: "Work structure",
      subtext:
        "Expectations for my work were well-defined and my tasks were accurate to the job description.",
      pct: workStructure,
    },
    {
      label: "Career growth",
      subtext:
        "I gained skills and knowledge that will contribute meaningfully to my long-term professional development.",
      pct: careerGrowth,
    },
  ];

  const kpiTiles = (
    <div className="flex gap-3">
      <div className="flex flex-[1_0_0] flex-col gap-2 bg-[#f7f7f7] px-3 py-2 rounded-lg min-w-0">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <p className="text-cooper-gray-400 text-[16px] leading-6 tracking-[-0.16px]">
              Work model
            </p>
            {workEnvironmentAlerts.length > 0 && (
              <InfoIcon
                tooltip={
                  <>
                    {workEnvironmentAlerts.map((alert, i) => (
                      <div key={i}>{alert}</div>
                    ))}
                  </>
                }
              />
            )}
          </div>
          <p className="text-cooper-gray-900 text-[36px] leading-none">
            {workEnvironmentMode ?? "---"}
          </p>
        </div>
      </div>
      <div className="flex flex-[1_0_0] flex-col gap-0.5 bg-[#f7f7f7] px-3 py-2 rounded-lg min-w-0 self-stretch">
        <p className="text-cooper-gray-400 text-[16px] leading-6 tracking-[-0.16px]">
          Job length
        </p>
        <p className="text-cooper-gray-900 text-[36px] leading-none">
          {jobLengthDisplay}
        </p>
      </div>
    </div>
  );

  const benefitsTable = (
    <div className="flex flex-col gap-3">
      <BenefitRow label="Work Schedule">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          {workHoursDisplay}
        </p>
        {hasData && (
          <div className="flex flex-col mt-3">
            <p className="text-[#333] text-[16px] leading-6 tracking-[-0.16px]">
              {overtimeLabel}
            </p>
            <p className="text-cooper-gray-350 text-[14px] leading-normal">
              {overtimeCount}/{totalReviews} reported overtime work
            </p>
          </div>
        )}
        {hasData && (
          <div className="flex flex-col mt-3">
            <p className="text-[#333] text-[16px] leading-6 tracking-[-0.16px]">
              {averages.federalHolidays > 0.5
                ? "Federal holidays off"
                : averages.federalHolidays < 0.5
                  ? "No federal holidays off"
                  : "No data"}
            </p>
            <p className="text-cooper-gray-350 text-[14px] leading-normal">
              {Math.round(averages.federalHolidays * totalReviews)}/
              {totalReviews} reported federal holidays off
            </p>
          </div>
        )}
      </BenefitRow>

      <hr className="border-t border-[#ebebeb]" />

      <BenefitRow label="Transportation">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          {transportDisplay}
        </p>
      </BenefitRow>

      <hr className="border-t border-[#ebebeb]" />

      <BenefitRow label="Drug test">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          {drugTestDisplay}
        </p>
        {hasData && (
          <p className="text-cooper-gray-350 text-[14px] leading-normal">
            {Math.round(drugTest * totalReviews)}/{totalReviews} reported a drug
            test requirement
          </p>
        )}
      </BenefitRow>

      <hr className="border-t border-[#ebebeb]" />

      <BenefitRow label="Benefits">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          {benefitsDisplay}
        </p>
      </BenefitRow>

      <hr className="border-t border-[#ebebeb]" />

      <BenefitRow label="Tools & software">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          {toolsDisplay}
        </p>
      </BenefitRow>
    </div>
  );

  const cultureCard = (
    <div className="bg-[#f5f4ed] flex flex-col gap-3 p-4 rounded-lg">
      <div className="border-b border-[#d9d9d9] pb-3">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          Company culture
        </p>
      </div>
      <div className="flex flex-col gap-3 pr-1">
        {cultureRows.map(({ label, count }) => (
          <div key={label} className="flex h-6 items-center justify-between">
            <p className="w-[140px] shrink-0 text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
              {label}
            </p>
            {hasData ? (
              <div className="flex w-[200px] gap-3 items-center">
                <div
                  className="flex h-2 gap-0.5 items-center"
                  style={{ width: `${Math.min(102, totalReviews * 26 - 2)}px` }}
                >
                  {Array.from({ length: totalReviews }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-lg ${
                        i < count ? "bg-[#f1895c]" : "bg-[#cbcbcb]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-cooper-gray-350 text-[14px] leading-normal whitespace-nowrap">
                  {count}/{totalReviews} reported
                </p>
              </div>
            ) : (
              <p className="text-cooper-gray-350 text-[14px] leading-normal">
                No data
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const supportCard = (
    <div className="bg-[#f5f4ed] flex flex-col gap-3 p-4 rounded-lg">
      <div className="border-b border-[#d9d9d9] pb-3">
        <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
          Co-op support
        </p>
      </div>
      <div className="flex flex-col gap-[14px] pr-1">
        {supportRows.map(({ label, subtext, pct }) => (
          <div key={label} className="flex gap-[90px] items-center">
            <div className="flex flex-1 flex-col gap-0.5 min-w-0">
              <p className="text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]">
                {label}
              </p>
              <p className="text-cooper-gray-400 text-[14px] leading-normal">
                {subtext}
              </p>
            </div>
            <div className="flex flex-col gap-[10px] shrink-0">
              <SupportBar pct={pct} hasData={hasData} />
              <p className="text-cooper-gray-350 text-[14px] leading-normal">
                {hasData ? `${Math.round(pct * 100)}% agree` : "No data"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isComparing) {
    return (
      <ModalContainer title="On the Job">
        <div className="flex flex-col gap-6">
          {kpiTiles}
          {benefitsTable}
          {cultureCard}
          {supportCard}
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer title="On the Job">
      <div className="flex gap-10 flex-wrap xl:flex-nowrap">
        {/* LEFT COLUMN */}
        <div className="flex flex-[1_0_0] flex-col gap-10 min-w-0">
          {kpiTiles}
          {benefitsTable}
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-[1_0_0] flex-col gap-2 justify-end self-stretch min-w-0">
          {cultureCard}
          {supportCard}
        </div>
      </div>
    </ModalContainer>
  );
}
