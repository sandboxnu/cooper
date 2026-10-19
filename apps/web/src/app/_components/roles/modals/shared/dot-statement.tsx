import { cn } from "@cooper/ui";

import type { CompareSize } from "../../../compare/compare-context";

interface DotBarProps {
  filledCount: number;
  totalCount: number;
  filledColor: string;
}

function DotBar({ filledCount, totalCount, filledColor }: DotBarProps) {
  return (
    <div className="flex flex-wrap gap-0.5">
      {Array.from({ length: totalCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "size-3 shrink-0 rounded-full",
            i >= filledCount && "bg-[#cbcbcb]",
          )}
          style={i < filledCount ? { backgroundColor: filledColor } : undefined}
        />
      ))}
    </div>
  );
}

interface DotStatementProps {
  label: string;
  filledCount: number;
  totalCount: number;
  filledColor: string;
  caption: string;
  size: CompareSize;
}

export function DotStatement({
  label,
  filledCount,
  totalCount,
  filledColor,
  caption,
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
        <p className="text-[14px] leading-normal text-cooper-gray-350">
          {totalCount > 0 ? caption : "No data"}
        </p>
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
