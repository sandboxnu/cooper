"use client";

import type { CompanyType } from "@cooper/db/schema";

import { api } from "~/trpc/react";
import { calculateRatings } from "~/utils/reviewCountByStars";
import { RatingSummary } from "../shared/rating-summary";

interface CompanyReviewProps {
  className?: string;
  companyObj: CompanyType | undefined;
  // Off when a section card supplies the "Overall rating" title
  showTitle?: boolean;
}

export function CompanyReview({
  companyObj,
  showTitle = true,
}: CompanyReviewProps) {
  const reviews = api.review.getByCompany.useQuery({
    id: companyObj?.id ?? "",
  });

  const avg = api.company.getAverageById.useQuery({
    companyId: companyObj?.id ?? "",
  });

  const ratings = calculateRatings(reviews.data ?? []);

  const averages = api.review.list
    .useQuery({})
    .data?.map((review) => review.overallRating)
    .filter((rating): rating is number => rating != null && rating !== 0);
  const cooperAvg: number =
    Math.round(
      ((averages ?? []).reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) /
        (averages?.length ?? 1)) *
        10,
    ) / 10;

  const reviewCount = reviews.data?.length ?? 0;

  return (
    <div className="flex w-full flex-col gap-3">
      {showTitle && (
        <p className="text-[16px] font-bold leading-6 tracking-[-0.16px] text-cooper-gray-400">
          Overall rating
        </p>
      )}
      <RatingSummary
        ratings={ratings}
        averageRating={avg.data?.averageOverallRating ?? 0}
        reviewCount={reviewCount}
        caption={
          <>
            <p>
              Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </p>
            <p>Cooper average: {cooperAvg}</p>
          </>
        }
        className="flex-col gap-5 sm:flex-row sm:gap-20"
      />
    </div>
  );
}
