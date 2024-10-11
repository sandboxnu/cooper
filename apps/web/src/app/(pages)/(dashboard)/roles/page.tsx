"use client";

import { useState } from "react";

import type {
  ReviewType,
  WorkEnvironmentType,
  WorkTermType,
} from "@cooper/db/schema";
import { cn } from "@cooper/ui";

import { ReviewCard } from "~/app/_components/reviews/review-card";
import { ReviewCardPreview } from "~/app/_components/reviews/review-card-preview";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

export default function Roles({
  searchParams,
}: {
  searchParams?: {
    workTerm?: WorkTermType;
    workEnvironment?: WorkEnvironmentType;
  };
}) {
  const reviews = api.review.list.useQuery({
    options: {
      cycle: searchParams?.workTerm,
      term: searchParams?.workEnvironment,
    },
  });

  //implement fuse.js here

  const [selectedReview, setSelectedReview] = useState<ReviewType | undefined>(
    reviews.data ? reviews.data[0] : undefined,
  );

  return (
    <>
      <SearchFilter />
      {/* TODO: Loading animations */}
      {reviews.data && (
        <div className="mb-8 grid h-[75dvh] w-4/5 grid-cols-5 gap-4 lg:w-3/4">
          <div className="col-span-2 gap-3 overflow-scroll pr-4">
            {reviews.data.map((review, i) => {
              return (
                <div key={review.id} onClick={() => setSelectedReview(review)}>
                  <ReviewCardPreview
                    reviewObj={review}
                    className={cn(
                      "mb-4 hover:border-2",
                      selectedReview
                        ? selectedReview.id === review.id &&
                            "border-2 bg-cooper-gray-100"
                        : !i && "border-2 bg-cooper-gray-100",
                    )}
                  />
                </div>
              );
            })}
          </div>
          <div className="col-span-3 overflow-scroll">
            {reviews.data.length > 0 && reviews.data[0] && (
              <ReviewCard reviewObj={selectedReview ?? reviews.data[0]} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
