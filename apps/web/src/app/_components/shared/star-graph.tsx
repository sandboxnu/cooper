import Image from "next/image";
import { cn } from "@cooper/ui";

export default function StarGraph({
  ratings,
  averageOverallRating,
  reviews,
  isComparing = false,
}: {
  ratings: { stars: number; percentage: number }[];
  averageOverallRating: number;
  reviews: number;
  isComparing?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "mr-6 flex justify-between w-full items-start text-cooper-gray-400",
          // Keep clear space between the big rating and the bars
          isComparing ? "flex-col" : "flex-col md:flex-row md:gap-10",
        )}
      >
        <div className="flex flex-col ">
          <div className="flex flex-row gap-2 pt-1">
            <div className="text-[48px] leading-normal text-cooper-gray-900">
              {averageOverallRating.toFixed(1)}
            </div>
            <Image src="/svg/star.svg" alt="Star icon" width={36} height={36} />
          </div>
          <div className="pt-4 text-[14px] leading-normal">
            {reviews} {reviews === 1 ? "review" : "reviews"}
          </div>
        </div>
        <div className="mt-4 w-[242px] max-w-full space-y-1 pt-1 md:mt-0">
          {ratings.map((rating) => (
            <div key={rating.stars} className="flex items-center">
              {/* Fixed width so every bar starts at the same x ("1 star" is
                  shorter than the others) */}
              <span className="mr-2 w-[52px] shrink-0 text-[14px] leading-normal text-cooper-gray-400">
                {rating.stars} {rating.stars === 1 ? "star" : "stars"}
              </span>
              <div className="ml-1 h-2 flex-1 rounded-full bg-cooper-gray-150">
                <div
                  className="h-full rounded-full bg-[#ffa400]"
                  style={{ width: `${rating.percentage}%` }}
                ></div>
              </div>
              <div className="pl-2 text-[14px] leading-normal">
                {Math.round((rating.percentage / 100) * reviews)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
