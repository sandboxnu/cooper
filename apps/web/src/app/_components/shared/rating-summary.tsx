import Image from "next/image";

import { cn } from "@cooper/ui";

interface RatingSummaryProps {
  ratings: { stars: number; percentage: number }[];
  averageRating: number;
  reviewCount: number;
  // Small gray text under the big rating number
  caption: React.ReactNode;
  // Arranges the rating block and the star bars (row/column, spacing)
  className?: string;
}

// Big average rating + per-star bars, shared by compare Reviews and company
// Overall rating
export function RatingSummary({
  ratings,
  averageRating,
  reviewCount,
  caption,
  className,
}: RatingSummaryProps) {
  return (
    <div className={cn("flex items-start", className)}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-[48px] leading-normal text-cooper-gray-900">
            {averageRating.toFixed(1)}
          </p>
          <Image src="/svg/star.svg" alt="Star icon" width={36} height={36} />
        </div>
        <div className="text-[14px] leading-normal text-cooper-gray-400">
          {caption}
        </div>
      </div>
      <div className="flex w-[242px] max-w-full flex-col gap-1">
        {ratings.map(({ stars, percentage }) => (
          <div key={stars} className="flex items-center gap-3">
            <p className="w-[52px] shrink-0 text-[14px] leading-normal text-cooper-gray-400">
              {stars} {stars === 1 ? "star" : "stars"}
            </p>
            <div className="h-2 min-w-px flex-1 rounded-lg bg-cooper-gray-150">
              <div
                className="h-full rounded-lg bg-[#ffa400]"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="w-6 shrink-0 text-[14px] leading-normal text-cooper-gray-400">
              {Math.round((percentage / 100) * reviewCount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
