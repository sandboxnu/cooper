"use client";

import { cn } from "@cooper/ui";
import type { CompareSize } from "../../compare/compare-context";
import {
  CompareSection,
  CompareSectionTitle,
} from "../../compare/compare-section";
import ModalContainer from "../../reviews/modal";
import { AgreementCard } from "./shared/agreement-card";
import { InfoIcon } from "./shared/info-icon";

// Company culture and co-op support topics, keyed by their review field; also
// used by the company page
export const CULTURE_TOPICS = [
  { label: "Team outings", field: "teamOutings" },
  { label: "Coffee chats", field: "coffeeChats" },
  { label: "Constructive feedback", field: "constructiveFeedback" },
] as const;

export const SUPPORT_TOPICS = [
  {
    label: "Onboarding",
    subtext:
      "I was properly onboarded into the company and role, with prompt communication before my first day.",
    field: "onboarding",
  },
  {
    label: "Work structure",
    subtext:
      "Expectations for my work were well-defined and my tasks were accurate to the job description.",
    field: "workStructure",
  },
  {
    label: "Career growth",
    subtext:
      "I gained skills and knowledge that will contribute meaningfully to my long-term professional development.",
    field: "careerGrowth",
  },
] as const;

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
  compareSize?: CompareSize;
  // Section title; the company page names the company
  title?: React.ReactNode;
}

const BENEFIT_LABELS: { key: keyof AveragesData; label: string }[] = [
  { key: "freeMerch", label: "free merch" },
  { key: "freeLunch", label: "lunch provided" },
  { key: "snackBar", label: "snack bar" },
  { key: "travelBenefits", label: "travel benefits" },
];

export function BenefitRow({
  label,
  labelClassName,
  children,
}: {
  label: string;
  // e.g. a wider label column (company overview)
  labelClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-10 items-start">
      <p
        className={cn(
          "w-[120px] shrink-0 text-cooper-gray-400 text-[16px] leading-6 tracking-[-0.16px]",
          labelClassName,
        )}
      >
        {label}
      </p>
      <div className="flex flex-1 flex-col min-w-0">{children}</div>
    </div>
  );
}

function CompareBenefitCategory({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-[14px] leading-normal text-cooper-gray-400">{label}</p>
      {children}
    </div>
  );
}

// "No data" shows in the label gray instead of the value color
const noDataTone = (text: string) =>
  text === "No data" && "text-cooper-gray-400";

function CompareReportedLine({
  label,
  caption,
}: {
  label: string;
  caption: string;
}) {
  return (
    <div className="flex flex-col">
      <p
        className={cn(
          "text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-550",
          noDataTone(label),
        )}
      >
        {label}
      </p>
      <p className="text-[14px] leading-normal text-cooper-gray-350">
        {caption}
      </p>
    </div>
  );
}

export function OnTheJobModal({
  averages,
  isComparing,
  compareSize,
  title = "On the Job",
}: OnTheJobModalProps) {
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
      : overtimeCount > 0
        ? "Some worked overtime"
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

  const cultureCounts = {
    teamOutings: teamOutingsCount,
    coffeeChats: coffeeChatCount,
    constructiveFeedback: constructiveFeedbackCount,
  };
  const cultureRows = CULTURE_TOPICS.map(({ label, field }) => ({
    label,
    count: cultureCounts[field],
  }));

  const supportShares = { onboarding, workStructure, careerGrowth };
  const supportRows = SUPPORT_TOPICS.map(({ label, subtext, field }) => ({
    label,
    subtext,
    pct: supportShares[field],
  }));

  const headline =
    [workEnvironmentMode, jobLengthMin !== null ? jobLengthDisplay : null]
      .filter(Boolean)
      .join(", ") || "---";

  const headlineBlock = (
    <div className="flex items-end gap-3">
      {/* Same line height as the interview types headline */}
      <p className="text-[36px] font-normal leading-normal tracking-[-0.72px] text-cooper-gray-900">
        {headline}
      </p>
      {workEnvironmentAlerts.length > 0 && (
        // pb sets the circle's bottom on the text baseline (36px, leading-normal)
        <div className="flex items-center pb-[13px]">
          <InfoIcon
            tooltip={
              <>
                {workEnvironmentAlerts.map((alert, i) => (
                  <div key={i}>{alert}</div>
                ))}
              </>
            }
          />
        </div>
      )}
    </div>
  );

  const benefitsTable = (
    <div className="flex flex-col gap-3">
      <BenefitRow label="Work hours">
        <p className={cn("text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]", noDataTone(workHoursDisplay))}>
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
            {/* At least half saying yes counts as federal holidays off */}
            <p className="text-[#333] text-[16px] leading-6 tracking-[-0.16px]">
              {averages.federalHolidays >= 0.5
                ? "Federal holidays off"
                : "No federal holidays off"}
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
        <p className={cn("text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]", noDataTone(transportDisplay))}>
          {transportDisplay}
        </p>
      </BenefitRow>

      <hr className="border-t border-[#ebebeb]" />

      <BenefitRow label="Drug test">
        <p className={cn("text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]", noDataTone(drugTestDisplay))}>
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
        <p className={cn("text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]", noDataTone(benefitsDisplay))}>
          {benefitsDisplay}
        </p>
      </BenefitRow>

      <hr className="border-t border-[#ebebeb]" />

      <BenefitRow label="Tools & software">
        <p className={cn("text-cooper-gray-900 text-[16px] leading-6 tracking-[-0.16px]", noDataTone(toolsDisplay))}>
          {toolsDisplay}
        </p>
      </BenefitRow>
    </div>
  );

  const supportCountRows = supportRows.map(({ label, subtext, pct }) => ({
    label,
    subtext,
    count: Math.round(pct * totalReviews),
  }));

  const cultureCard = (
    <AgreementCard
      title="Company culture"
      rows={cultureRows}
      totalReviews={totalReviews}
      countLabel="reported"
      // Bleed 6px past the section padding on small screens, like compare
      className="max-sm:-mx-1.5"
    />
  );

  const supportCard = (
    <AgreementCard
      title="Co-op support"
      rows={supportCountRows}
      totalReviews={totalReviews}
      countLabel="agree"
      className="max-sm:-mx-1.5"
    />
  );

  if (compareSize) {
    // TODO: placeholder no-data copy until no-data handling is decided
    let federalHolidaysLabel = "No data";
    if (hasData) {
      // At least half saying yes counts as federal holidays off
      federalHolidaysLabel =
        averages.federalHolidays >= 0.5
          ? "Federal holidays off"
          : "No federal holidays off";
    }

    const valueClass =
      "text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900";
    // Divider + 12px either side, matching the gap between benefit rows
    const dividedTopic = "mt-3 border-t border-cooper-gray-125 pt-3";

    // One child per grid row; see COMPARE_ROWS.onTheJob
    return (
      <CompareSection section="onTheJob" className="px-5 py-[18px]">
        <div>
          <CompareSectionTitle>On the Job</CompareSectionTitle>
          <p className="text-[36px] leading-normal tracking-[-0.72px] text-cooper-gray-900">
            {headline}
          </p>
        </div>
        <CompareBenefitCategory label="Work hours" className="pt-6">
          <div className="flex flex-col gap-3">
            <p className={cn(valueClass, noDataTone(workHoursDisplay))}>{workHoursDisplay}</p>
            <CompareReportedLine
              label={hasData ? overtimeLabel : "No data"}
              caption={`${overtimeCount}/${totalReviews} reported`}
            />
            <CompareReportedLine
              label={federalHolidaysLabel}
              caption={`${Math.round(averages.federalHolidays * totalReviews)}/${totalReviews} reported`}
            />
          </div>
        </CompareBenefitCategory>
        <CompareBenefitCategory label="Transportation" className={dividedTopic}>
          <p className={cn(valueClass, noDataTone(transportDisplay))}>{transportDisplay}</p>
        </CompareBenefitCategory>
        <CompareBenefitCategory label="Drug test" className={dividedTopic}>
          <div className="flex flex-col">
            <p className={cn(valueClass, noDataTone(drugTestDisplay))}>{drugTestDisplay}</p>
            <p className="text-[14px] leading-normal text-cooper-gray-350">
              {Math.round(drugTest * totalReviews)}/{totalReviews} reported
            </p>
          </div>
        </CompareBenefitCategory>
        <CompareBenefitCategory label="Benefits" className={dividedTopic}>
          <p className={cn(valueClass, noDataTone(benefitsDisplay))}>{benefitsDisplay}</p>
        </CompareBenefitCategory>
        <CompareBenefitCategory
          label="Tools & software"
          className={dividedTopic}
        >
          <p className={cn(valueClass, noDataTone(toolsDisplay))}>{toolsDisplay}</p>
        </CompareBenefitCategory>
        <AgreementCard
          title="Company culture"
          rows={cultureRows}
          totalReviews={totalReviews}
          countLabel="reported"
          isCompare
          className={compareSize === "sm" ? "-mx-1.5 mt-8" : "-mx-1.5 mt-6"}
        />
        <AgreementCard
          title="Co-op support"
          rows={supportCountRows}
          totalReviews={totalReviews}
          countLabel="in favor"
          isCompare
          className="-mx-1.5 mt-2"
        />
      </CompareSection>
    );
  }

  if (isComparing) {
    return (
      <ModalContainer title={title}>
        <div className="flex flex-col gap-6">
          {headlineBlock}
          {benefitsTable}
          {/* Same 8px gap as the xl two-column layout and compare */}
          <div className="flex flex-col gap-2">
            {cultureCard}
            {supportCard}
          </div>
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer title={title}>
      <div className="flex gap-10 flex-wrap xl:flex-nowrap">
        {/* LEFT COLUMN */}
        <div className="flex flex-[1_0_0] flex-col gap-10 min-w-0">
          {headlineBlock}
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
