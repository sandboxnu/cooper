"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { calculateRatings } from "~/utils/reviewCountByStars";
import StarGraph from "../shared/star-graph";

interface CompanyReviewProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyReview({ companyObj }: CompanyReviewProps) {
  const avg = api.company.getAverageById.useQuery({
    companyId: companyObj?.id ?? "",
  });

  const reviews = api.review.getByCompany.useQuery({
    id: companyObj?.id ?? "",
  });

  const ratings = calculateRatings(reviews.data ?? []);

  return (
    <div className="mx-1 w-full max-w-lg ">
      <div className="pt-6">
        <StarGraph
          ratings={ratings}
          averageOverallRating={avg.data?.averageOverallRating ?? 0}
        />
      </div>
    </div>
  );
}
