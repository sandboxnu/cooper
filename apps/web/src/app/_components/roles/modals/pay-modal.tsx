"use client";

import { useState } from "react";

import { prettyIndustry } from "~/utils/stringHelpers";
import SectionCard from "../../shared/section-card";
import { PipBar } from "./shared/pip-bar";
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
      <p className="text-[16px] tracking-[-0.16px] text-[#151515]">{label}</p>
      <div className="flex flex-col items-start gap-[10px]">
        <PipBar
          filledCount={count}
          totalCount={totalCount}
          filledColor="#92c6cd"
        />
        <p className="text-[14px] leading-[normal] text-[#767676]">
          {count}/{totalCount} reported
        </p>
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
    freeLunch: number;
  };
  globalData: PayData | undefined;
  industryData: PayData | undefined;
  industryName: string | null;
  compact?: boolean;
}

export function PayModal({
  averages,
  globalData,
  industryData,
  industryName,
  compact = false,
}: PayModalProps) {
  const [activeTab, setActiveTab] = useState<"total" | "industry">("total");

  const activeBarData =
    activeTab === "total"
      ? (globalData?.payDistribution ?? [])
      : (industryData?.payDistribution ?? []);

  const industryAvgPay = industryData?.averageHourlyPay ?? 0;
  const prettyIndustryName = industryName ? prettyIndustry(industryName) : null;

  const avgPay = averages.averageHourlyPay;

  const totalBarCount = activeBarData.reduce((s, b) => s + b.count, 0);

  // For each bucket, precompute whether it contains the industry average and
  // how far through the bucket (0–1) the average falls. The line and label are
  // rendered inside the relevant column so left: x% is relative to that column's
  // rendered width — no global percentage math needed.
  const bucketMeta = activeBarData.map((bucket) => {
    const isTarget =
      industryAvgPay > 0 &&
      industryAvgPay >= bucket.min &&
      (bucket.max === null || industryAvgPay < bucket.max);
    const bucketRange = bucket.max !== null ? bucket.max - bucket.min : 20;
    const fractionWithin = isTarget
      ? Math.min((industryAvgPay - bucket.min) / bucketRange, 1)
      : 0;
    return { isTarget, fractionWithin };
  });

  const { totalReviews } = averages;
  const ptoCount = Math.round(averages.pto * totalReviews);
  const travelCount = Math.round(averages.travelBenefits * totalReviews);
  const foodCount = Math.round(averages.freeLunch * totalReviews);

  if (compact) {
    return (
      <SectionCard title="Pay">
        <div className="flex flex-col gap-[24px]">
          <p className="text-[36px] font-normal leading-[normal] tracking-[-0.72px] text-[#151515]">
            ${Math.round(avgPay)}/hr
          </p>
          <div className="flex flex-col gap-[16px]">
            <p className="text-[16px] font-bold leading-[24px] tracking-[-0.16px] text-[#151515]">
              Pay Benefits
            </p>
            <div className="flex flex-col gap-[20px]">
              <CompactBenefitRow
                label="PTO"
                count={ptoCount}
                totalCount={totalReviews}
              />
              <CompactBenefitRow
                label="Travel Stipend"
                count={travelCount}
                totalCount={totalReviews}
              />
              <CompactBenefitRow
                label="Free Lunch"
                count={foodCount}
                totalCount={totalReviews}
              />
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Pay">
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-start gap-[32px]">
          {/* Left — pay histogram */}
          <div className="flex w-[321px] shrink-0 flex-col gap-[20px] overflow-clip">
            <div className="flex flex-col">
              <p className="text-[36px] font-normal leading-[normal] text-[#151515]">
                ${Math.round(avgPay)}/hr
              </p>
              <p className="text-[16px] leading-[24px] tracking-[-0.16px] text-[#151515]">
                Average hourly pay
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">
              <TabToggle activeTab={activeTab} onChange={setActiveTab} />

              <div className="flex flex-col gap-[8px]">
                {/* Industry average legend */}
                <div className="flex items-center gap-[8px]">
                  <span className="h-[18px] w-[18px] shrink-0 rounded-full bg-[#ffb97f]" />
                  <span className="whitespace-nowrap text-[14px] text-[#5a5a5a]">
                    {prettyIndustryName
                      ? `Average for ${prettyIndustryName} jobs ${activeTab === "industry" ? "on Cooper" : "in industry"}`
                      : "Industry average"}
                    {": "}
                    {industryAvgPay > 0 ? (
                      <strong>${Math.round(industryAvgPay)}/hr</strong>
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
                      const { isTarget, fractionWithin } = bucketMeta[i]!;
                      const isHighlighted = isTarget;

                      return (
                        <div
                          key={bucket.label}
                          className="relative flex flex-col gap-[6px]"
                          style={{ flexGrow: Math.max(bucket.count, 1) }}
                        >
                          <div
                            className={`h-[36px] min-w-[16px] w-full rounded-[8px] ${
                              isHighlighted ? "bg-[#ffb97f]" : "bg-[#ffdcbf]"
                            }`}
                          />
                          <div className={`flex items-center pl-[3px] text-[14px] leading-[20px] text-[#808080]${isTarget ? " transition-opacity group-hover:opacity-0" : ""}`}>
                            {showLabel ? bucket.label : "..."}
                          </div>
                          {isTarget && (
                            <>
                              <div
                                className="pointer-events-none absolute bottom-[26px] top-0 z-10 border-l border-dashed border-[#808080]"
                                style={{ left: `${fractionWithin * 100}%` }}
                              />
                              <span
                                className="pointer-events-none absolute z-10 -translate-x-1/2 text-[14px] font-bold leading-[20px] text-[#808080] opacity-0 transition-opacity group-hover:opacity-100"
                                style={{
                                  left: `${fractionWithin * 100}%`,
                                  bottom: 0,
                                }}
                              >
                                ${Math.round(industryAvgPay)}
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
          <div className="w-px self-stretch border-l border-[#ebebeb]" />

          {/* Right — pay benefits */}
          <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
            <p className="text-[16px] font-bold leading-[24px] tracking-[-0.16px] text-[#5a5a5a]">
              Pay Benefits
            </p>
            <div className="flex flex-wrap content-start gap-x-[36px] gap-y-[20px]">
              <PipCard
                name="PTO"
                subtext={`${ptoCount}/${totalReviews} indicated receiving paid time off`}
                filledCount={ptoCount}
                totalCount={totalReviews}
                filledColor="#92c6cd"
              />
              <PipCard
                name="Travel Stipend"
                subtext={`${travelCount}/${totalReviews} indicated receiving a travel stipend`}
                filledCount={travelCount}
                totalCount={totalReviews}
                filledColor="#92c6cd"
              />
              <PipCard
                name="Free Lunch"
                subtext={`${foodCount}/${totalReviews} indicated receiving free lunch`}
                filledCount={foodCount}
                totalCount={totalReviews}
                filledColor="#92c6cd"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[12px] leading-[14px] tracking-[-0.12px] text-[#767676]">
          {totalReviews > 0
            ? `Based on ${totalReviews} response${totalReviews === 1 ? "" : "s"}`
            : "No responses"}
        </p>
      </div>
    </SectionCard>
  );
}
