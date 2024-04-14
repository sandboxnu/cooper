"use client";

import { useState } from "react";
import HeaderLayout from "~/components/header-layout";
import { ReviewCard } from "~/components/review-card";
import { ReviewCardPreview } from "~/components/review-card-preview";
import SearchFilter from "~/components/search-filter";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export default function Roles() {
  const reviews = api.review.list.useQuery();

  const [selectedReviewIdx, setSelectedReviewIdx] = useState<number>(0);

  return (
    <>
      <SearchFilter />
      {/* TODO: Loading animations */}
      {reviews.data && (
        <div className="mb-8 grid w-4/5 grid-cols-5 gap-4 lg:w-3/4">
          <div className="col-span-2 gap-3">
            {reviews.data.map((review, idx) => {
              return (
                <div key={review.id} onClick={() => setSelectedReviewIdx(idx)}>
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
              <ReviewCard
                reviewObj={reviews.data[selectedReviewIdx] || reviews.data[0]}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
