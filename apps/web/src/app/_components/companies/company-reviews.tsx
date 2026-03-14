"use client";

import type { CompanyType } from "@cooper/db/schema";

import { api } from "~/trpc/react";
import { calculateRatings } from "~/utils/reviewCountByStars";
import StarGraph from "../shared/star-graph";
import CompanyStatistics from "./company-statistics";
import {
  calculateJobTypes,
  calculatePay,
  calculatePayRange,
  calculateWorkModels,
} from "~/utils/companyStatistics";

interface CompanyReviewProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyReview({ companyObj }: CompanyReviewProps) {
  const reviews = api.review.getByCompany.useQuery({
    id: companyObj?.id ?? "",
  });

  const avg = api.company.getAverageById.useQuery({
    companyId: companyObj?.id ?? "",
  });

  const ratings = calculateRatings(reviews.data ?? []);
  const workModels = calculateWorkModels(reviews.data ?? []);
  const jobTypes = calculateJobTypes(reviews.data ?? []);
  const payStats = calculatePay(reviews.data ?? []);
  const payRange = calculatePayRange(reviews.data ?? []);

  const averages = api.review.list
    .useQuery({})
    .data?.filter((r) => r.overallRating != 0)
    .map((review) => review.overallRating);
  const cooperAvg: number =
    Math.round(
      ((averages ?? []).reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0) /
        (averages?.length ?? 1)) *
        10,
    ) / 10;

  return (
    <div className="mx-1 w-full">
      <div>
        <StarGraph
          ratings={ratings}
          averageOverallRating={avg.data?.averageOverallRating ?? 0}
          reviews={reviews.data?.length ?? 0}
          cooperAvg={cooperAvg}
        />
        {(reviews.data?.length ?? 0) > 0 && (
          <CompanyStatistics
            workModels={workModels}
            payStats={payStats}
            payRange={payRange}
            jobTypes={jobTypes}
          />
        )}
      </div>
    </div>
  );
}
