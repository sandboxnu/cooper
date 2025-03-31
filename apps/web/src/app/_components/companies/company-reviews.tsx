"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import StarGraph from "../shared/star-graph";

interface CompanyReviewProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyReview({ companyObj }: CompanyReviewProps) {
  const avg = api.company.getAverageById.useQuery({
    companyId: companyObj?.id ?? "",
  });

  const ratings = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 6 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <Card className="w-full max-w-lg rounded-lg border-[0.75px] border-cooper-gray-400">
      <CardHeader className="flex h-6 justify-center rounded-t-lg border-b-[0.75px] border-cooper-gray-400 bg-cooper-gray-100">
        <CardTitle className="text-base font-medium text-gray-800">
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="rounded-b-lg pt-6">
        <StarGraph
          ratings={ratings}
          averageOverallRating={avg.data?.averageOverallRating ?? 0}
        />
      </CardContent>
    </Card>
  );
}
