"use client";

import { Review } from "@prisma/client";
import { useState } from "react";
import { ReviewCard } from "~/components/review-card";
import { ReviewCardPreview } from "~/components/review-card-preview";
import SearchFilter from "~/components/search-filter";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function Roles() {
  const reviews = api.review.list.useQuery();

  const [selectedReview, setSelectedReview] = useState<Review | undefined>(
    reviews.data ? reviews.data[0] : undefined,
  );

  return (
    <>
      <SearchFilter />
      {/* TODO: Loading animations */}
      {reviews.data && (
        <div className="mb-8 grid w-4/5 grid-cols-5 gap-4 lg:w-3/4">
          <div className="col-span-2 gap-3">
            {reviews.data.map((review) => {
              return (
                <div key={review.id} onClick={() => setSelectedReview(review)}>
                  <ReviewCardPreview
                    reviewObj={review}
                    className={cn("mb-4 hover:border-2")}
                  />
                </div>
              );
            })}
          </div>
          <div className="col-span-3">
            {reviews.data.length > 0 && reviews.data[0] && (
              <ReviewCard reviewObj={selectedReview || reviews.data[0]} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
