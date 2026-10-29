import { cn } from "@cooper/ui";

import type { CompareSize } from "../../../compare/compare-context";

interface DotBarProps {
  filledCount: number;
  totalCount: number;
  filledColor: string;
  className?: string;
}

export function DotBar({
  filledCount,
  totalCount,
  filledColor,
  className,
}: DotBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {Array.from({ length: totalCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "size-[18px] shrink-0 rounded-full",
            i >= filledCount && "border-[1.5px] border-[#cbcbcb]",
          )}
          style={i < filledCount ? { backgroundColor: filledColor } : undefined}
        />
      ))}
    </div>
  );
}

interface DotCountProps {
  count: number;
  total: number;
  label: string;
  // Omit to keep the count in the caption gray
  color?: string;
  className?: string;
}

// "2/3 reported" with the count bolded, optionally in its dot color
export function DotCount({
  count,
  total,
  label,
  color,
  className,
}: DotCountProps) {
  return (
    <p
      className={cn(
        "text-[14px] leading-normal text-cooper-gray-350",
        className,
      )}
    >
      <span className="font-bold" style={color ? { color } : undefined}>
        {count}
      </span>
      /{total} {label}
    </p>
  );
}

interface DotStatementProps {
  label: string;
  filledCount: number;
  totalCount: number;
  filledColor: string;
  countLabel: string;
  grayCount?: boolean;
  size: CompareSize;
}

export function DotStatement({
  label,
  filledCount,
  totalCount,
  filledColor,
  countLabel,
  grayCount = false,
  size,
}: DotStatementProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between",
        size === "sm" ? "w-full" : "w-[125px]",
      )}
    >
      <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
        {label}
      </p>
      <div className="flex flex-col gap-2 pt-3">
        {totalCount > 0 && (
          <DotBar
            filledCount={filledCount}
            totalCount={totalCount}
            filledColor={filledColor}
          />
        )}
        {totalCount > 0 ? (
          <DotCount
            count={filledCount}
            total={totalCount}
            label={countLabel}
            color={grayCount ? undefined : filledColor}
          />
        ) : (
          <p className="text-[14px] leading-normal text-cooper-gray-350">
            No data
          </p>
        )}
      </div>
    </div>
  );
}

interface DotStatementCardProps {
  title?: string;
  size: CompareSize;
  className?: string;
  children: React.ReactNode;
}

// Gray subsection card; bleeds 6px past its section's padding
export function DotStatementCard({
  title,
  size,
  className,
  children,
}: DotStatementCardProps) {
  return (
    <div
      className={cn(
        "-mx-1.5 flex flex-col gap-3 rounded-lg border border-black/[0.02] bg-[#fafaf7] p-4",
        className,
      )}
    >
      {title && (
        <div className="border-b border-[#d9d9d9] pb-3">
          <p className="text-[16px] leading-6 tracking-[-0.16px] text-cooper-gray-900">
            {title}
          </p>
        </div>
      )}
      <div
        className={cn(
          "flex gap-5",
          size === "sm" ? "flex-col" : "flex-wrap content-start",
        )}
      >
        {children}
      </div>
    </div>
  );
}
