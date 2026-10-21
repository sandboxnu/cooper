import { cn } from "@cooper/ui";

import { DotBar, DotCount } from "./dot-statement";

export interface AgreementRow {
  label: string;
  // Gray description under the label; not shown in compare
  subtext?: string;
  count: number;
}

interface AgreementCardProps {
  title: string;
  rows: AgreementRow[];
  totalReviews: number;
  // e.g. "reported" or "agree"
  countLabel: string;
  filledColor?: string;
  // Compare cards always use the stacked column layout, without subtext
  isCompare?: boolean;
  className?: string;
}

// Gray card of "On the Job card topics" (Company culture, Co-op support, and
// pay benefits in compare). Its
// layout follows the card's own width, since the card doesn't always track the
// screen:
// - narrow: column topics (text, then dots + count), stacked
// - box-md: row topics (text left, dots + count right)
// - box-lg: column topics side by side, dots + count along the bottom
// With no reviews, "No data" replaces the subtext (columns) or the dots +
// count (rows).
export function AgreementCard({
  title,
  rows,
  totalReviews,
  countLabel,
  filledColor = "#f1895c",
  isCompare = false,
  className,
}: AgreementCardProps) {
  const hasData = totalReviews > 0;
  const hasSubtext = !isCompare && rows.some((row) => row.subtext);

  const noData = (
    <p className="text-[14px] leading-normal text-cooper-gray-400">No data</p>
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-black/[0.02] bg-[#fafaf7] p-4",
        !isCompare && "[container-type:inline-size]",
        className,
      )}
    >
      <div className="border-b border-[#d9d9d9] pb-3">
        <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
          {title}
        </p>
      </div>
      <div
        className={cn(
          "flex flex-col",
          isCompare
            ? "gap-4"
            : hasSubtext
              ? "gap-6"
              : "gap-4 box-md:gap-5",
          !isCompare && "box-lg:flex-row box-lg:gap-8",
        )}
      >
        {rows.map(({ label, subtext, count }) => (
          <div
            key={label}
            className={cn(
              "flex min-w-0 flex-col",
              // Small topics with subtext get 4px more before the dots
              hasSubtext && "gap-1",
              // justify-between carries into box-lg, where it pins the dots
              // + count to the bottom of each (stretched) column
              !isCompare &&
                "box-md:flex-row box-md:items-center box-md:justify-between box-md:gap-0 box-lg:flex-1 box-lg:flex-col box-lg:items-start",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 flex-col gap-0.5",
                !isCompare && "box-md:flex-1 box-lg:w-full box-lg:flex-none",
              )}
            >
              <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
                {label}
              </p>
              {hasData && subtext && !isCompare && (
                <p className="text-[14px] leading-normal text-cooper-gray-400">
                  {subtext}
                </p>
              )}
              {/* Column no data: under the label */}
              {!hasData && (
                <div className={cn(!isCompare && "box-md:hidden box-lg:block")}>
                  {noData}
                </div>
              )}
            </div>
            {hasData ? (
              <div
                className={cn(
                  "flex shrink-0 items-center gap-2 pt-3",
                  !isCompare && "box-md:pl-10 box-md:pt-0 box-lg:pl-0 box-lg:pt-3",
                )}
              >
                <DotBar
                  className="max-w-[102px]"
                  filledCount={count}
                  totalCount={totalReviews}
                  filledColor={filledColor}
                />
                <DotCount
                  count={count}
                  total={totalReviews}
                  label={countLabel}
                  className="whitespace-nowrap"
                />
              </div>
            ) : (
              // Row no data: on the right, in place of the dots + count
              !isCompare && (
                <div className="hidden shrink-0 whitespace-nowrap pl-10 box-md:block box-lg:hidden">
                  {noData}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
