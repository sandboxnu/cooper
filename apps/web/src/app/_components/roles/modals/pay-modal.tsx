"use client";

import { useState } from "react";

import { cn } from "@cooper/ui";

import { prettyIndustry } from "~/utils/stringHelpers";
import type { CompareSize } from "../../compare/compare-context";
import {
  CompareSection,
  CompareSectionTitle,
} from "../../compare/compare-section";
import ModalContainer from "../../reviews/modal";
import {
  DotBar,
  DotCount,
  DotStatement,
  DotStatementCard,
} from "./shared/dot-statement";
import { PipCard } from "./shared/pip-card";
import { TabToggle } from "./shared/tab-toggle";

interface PayBucket {
  label: string;
  min: number;
  max: number | null;
  count: number;
}

interface PayData {
  averageHourlyPay: number;
  payDistribution: PayBucket[];
  totalReviews: number;
}

interface CompactBenefitRowProps {
  label: string;
  count: number;
  totalCount: number;
}

function CompactBenefitRow({
  label,
  count,
  totalCount,
}: CompactBenefitRowProps) {
  return (
    <div className="flex items-start justify-between">
      <p className="text-[16px] tracking-[-0.16px] text-cooper-gray-900">
        {label}
      </p>
      <div className="flex flex-col items-start gap-[10px]">
        <DotBar
          className="max-w-[102px]"
          filledCount={count}
          totalCount={totalCount}
          filledColor="#92c6cd"
        />
        <DotCount
          count={count}
          total={totalCount}
          label="reported"
        />
      </div>
    </div>
  );
}

interface PayModalProps {
  averages: {
    averageHourlyPay: number;
    totalReviews: number;
    pto: number;
    travelBenefits: number;
  };
  globalData: PayData | undefined;
  industryData: PayData | undefined;
  industryName: string | null;
  compact?: boolean;
  compareSize?: CompareSize;
}

export function PayModal({
  averages,
  globalData,
  industryData,
  industryName,
  compact = false,
  compareSize,
}: PayModalProps) {
  const [activeTab, setActiveTab] = useState<"total" | "industry">("total");

  const activeBarData =
    activeTab === "total"
      ? (globalData?.payDistribution ?? [])
      : (industryData?.payDistribution ?? []);

  const globalAvgPay = globalData?.averageHourlyPay ?? 0;
  const industryAvgPay = industryData?.averageHourlyPay ?? 0;
  const activeAvgPay = activeTab === "total" ? globalAvgPay : industryAvgPay;
  const prettyIndustryName = industryName ? prettyIndustry(industryName) : null;

  const avgPay = averages.averageHourlyPay;

  const totalBarCount = activeBarData.reduce((s, b) => s + b.count, 0);

  // For each bucket, precompute whether it contains the active tab's average and
  // how far through the bucket (0–1) the average falls. The line and label are
  // rendered inside the relevant column so left: x% is relative to that column's
  // rendered width — no global percentage math needed.
  const bucketMeta = activeBarData.map((bucket) => {
    const isTarget =
      activeAvgPay > 0 &&
      activeAvgPay >= bucket.min &&
      (bucket.max === null || activeAvgPay < bucket.max);
    const bucketRange = bucket.max !== null ? bucket.max - bucket.min : 20;
    const fractionWithin = isTarget
      ? Math.min((activeAvgPay - bucket.min) / bucketRange, 1)
      : 0;
    return { isTarget, fractionWithin };
  });

  const { totalReviews } = averages;
  const ptoCount = Math.round(averages.pto * totalReviews);
  const travelCount = Math.round(averages.travelBenefits * totalReviews);

  if (compareSize) {
    const isSmall = compareSize === "sm";
    return (
      // One child per grid row; see COMPARE_ROWS.pay
      <CompareSection section="pay" className={cn(isSmall && "px-5 py-4")}>
        <div>
          <CompareSectionTitle>Pay</CompareSectionTitle>
          <p
            className={cn(
              "text-[36px] leading-normal text-cooper-gray-900",
              isSmall && "tracking-[-0.72px]",
            )}
          >
            ${Math.round(avgPay)}/hr
          </p>
        </div>
        <DotStatementCard size={compareSize} className="mt-6">
          <DotStatement
            label="PTO"
            filledCount={ptoCount}
            totalCount={totalReviews}
            filledColor="#92c6cd"
            countLabel="reported"
            grayCount
            size={compareSize}
          />
          <DotStatement
            label="Travel stipend"
            filledCount={travelCount}
            totalCount={totalReviews}
            filledColor="#92c6cd"
            countLabel="reported"
            grayCount
            size={compareSize}
          />
        </DotStatementCard>
      </CompareSection>
    );
  }

  if (compact) {
    return (
      <ModalContainer title="Pay">
        <div className="flex flex-col gap-[24px]">
          <p className="text-[36px] font-normal leading-[normal] tracking-[-0.72px] text-cooper-gray-900">
            ${Math.round(avgPay)}/hr
          </p>
          <div className="flex flex-col gap-[16px]">
            <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
              Pay benefits
            </p>
            <div className="flex flex-col gap-[20px]">
              <CompactBenefitRow
                label="PTO"
                count={ptoCount}
                totalCount={totalReviews}
              />
              <CompactBenefitRow
                label="Travel stipend"
                count={travelCount}
                totalCount={totalReviews}
              />
            </div>
          </div>
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer title="Pay">
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-start gap-[32px]">
          {/* Left — pay histogram */}
          <div className="flex w-[321px] shrink-0 flex-col gap-[20px] overflow-clip">
            <div className="flex flex-col">
              <p className="text-[36px] font-normal leading-[normal] text-cooper-gray-900">
                ${Math.round(avgPay)}/hr
              </p>
              <p className="text-[16px] leading-[24px] tracking-[-0.16px] text-cooper-gray-900">
                Average hourly pay
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <TabToggle activeTab={activeTab} onChange={setActiveTab} />

              <div className="flex flex-col gap-[8px]">
                {/* Average legend */}
                <div className="flex items-center gap-[8px]">
                  <span className="h-[18px] w-[18px] shrink-0 rounded-full bg-[#ffb97f]" />
                  <span className="whitespace-nowrap text-[14px] text-cooper-gray-400">
                    {activeTab === "total"
                      ? "Average pay across all jobs on Cooper"
                      : `Average pay across all ${prettyIndustryName ?? "industry"} jobs`}
                    {": "}
                    {activeAvgPay > 0 ? (
                      <strong>${Math.round(activeAvgPay)}/hr</strong>
                    ) : (
                      "--"
                    )}
                  </span>
                </div>

                {/* Histogram */}
                {activeBarData.length > 0 ? (
                  <div className="group flex w-full items-end gap-px">
                    {activeBarData.map((bucket, i) => {
                      const approxWidth =
                        totalBarCount > 0
                          ? (bucket.count / totalBarCount) * 321
                          : 0;
                      const showLabel = approxWidth >= 40;
                      const { isTarget, fractionWithin } = bucketMeta[i] ?? {
                        isTarget: false,
                        fractionWithin: 0,
                      };
                      const isHighlighted = isTarget;

                      return (
                        <div
                          key={bucket.label}
                          className="relative flex flex-col gap-[6px]"
                          style={{ flexGrow: Math.max(bucket.count, 1) }}
                        >
                          <div
                            className={`h-9 min-w-4 w-full rounded-[8px] ${
                              isHighlighted ? "bg-[#ffb97f]" : "bg-[#ffdcbf]"
                            }`}
                          />
                          <div
                            className={`flex items-center pl-[3px] text-[14px] leading-[20px] text-[#808080]${isTarget ? " transition-opacity duration-50 group-hover:opacity-0" : ""}`}
                          >
                            {showLabel ? bucket.label : "..."}
                          </div>
                          {isTarget && (
                            <>
                              <div
                                className="pointer-events-none absolute bottom-[26px] top-0 z-10 border-l border-dashed border-[#808080]"
                                style={{ left: `${fractionWithin * 100}%` }}
                              />
                              <span
                                className="pointer-events-none absolute z-10 -translate-x-1/2 text-[14px] font-bold leading-[20px] text-[#808080] opacity-0 transition-opacity duration-50 group-hover:opacity-100"
                                style={{
                                  left: `${fractionWithin * 100}%`,
                                  bottom: 0,
                                }}
                              >
                                ${Math.round(activeAvgPay)}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px self-stretch border-l border-cooper-gray-125" />

          {/* Right — pay benefits */}
          <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
            <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
              Pay benefits
            </p>
            <div className="flex flex-wrap content-start gap-x-[36px] gap-y-[20px]">
              <PipCard
                name="PTO"
                countLabel="indicated receiving paid time off"
                filledCount={ptoCount}
                totalCount={totalReviews}
                filledColor="#92c6cd"
                grayCount
              />
              <PipCard
                name="Travel stipend"
                countLabel="indicated receiving transportation or relocation assistance"
                filledCount={travelCount}
                totalCount={totalReviews}
                filledColor="#92c6cd"
                grayCount
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[12px] leading-[14px] tracking-[-0.12px] text-cooper-gray-350">
          {totalReviews > 0
            ? `Based on ${totalReviews} response${totalReviews === 1 ? "" : "s"}`
            : "No responses"}
        </p>
      </div>
    </ModalContainer>
  );
}
