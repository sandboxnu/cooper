"use client";

import type { CompanyType } from "@cooper/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import { ReviewCardStars } from "../reviews/review-card-stars";

interface CompanyReviewProps {
  className?: string;
  companyObj: CompanyType | undefined;
}

export function CompanyReview({ companyObj }: CompanyReviewProps) {
  const ratings = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 15 },
    { stars: 3, percentage: 6 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <Card className="w-full max-w-lg rounded-xl border-gray-300 outline outline-[1px] outline-[#474747]">
      <CardHeader className="border-b border-[#474747] bg-[#F7F7F7] pb-3">
        <CardTitle className="text-base font-medium text-gray-800">
          Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 flex items-start">
          <div className="mr-6">
            <h2 className="text-4xl font-bold">
              {Number(companyObj?.averageOverallRating ?? 0).toFixed(1)}
            </h2>
            <div className="my-1 flex">
              <ReviewCardStars
                numStars={4}
                // numStars={Number(companyObj?.averageOverallRating)}
              />
            </div>
            <p className="text-xs text-gray-500">
              Based on {companyObj?.totalReviews ?? 0} reviews
            </p>
          </div>

          <div className="flex-1 space-y-2 pt-1">
            {ratings.map((rating) => (
              <div key={rating.stars} className="flex items-center">
                <span className="flex w-8 items-center">
                  <svg
                    className="h-3 w-3 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-xs text-gray-600">
                    {rating.stars}
                  </span>
                </span>
                <div className="ml-1 h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-yellow-400"
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
