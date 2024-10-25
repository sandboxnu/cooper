"use client";

import { useEffect, useState } from "react";

import {
  ReviewType,
  WorkTermType,
  WorkEnvironmentType,
} from "@cooper/db/schema";
import { WorkEnvironment, WorkTerm} from "@cooper/db/schema";

import { ReviewCard } from "~/app/_components/reviews/review-card";
import { ReviewCardPreview } from "~/app/_components/reviews/review-card-preview";
import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";
import { z } from "zod";
import { useToast } from "@cooper/ui/hooks/use-toast"
import { cn } from "@cooper/ui";
import ErrorBanner from "~/app/_components/error-banner";

export default function Roles({
  searchParams,
}: {
  searchParams?: {
    cycle?: WorkTermType;
    term?: WorkEnvironmentType;
  };

}) {
  const { toast } = useToast()

  const RolesSearchParam = z.object({
    cycle: z
      .nativeEnum(WorkTerm, {
        message: "Invalid cycle type",
      })
      .optional(),
    term: z
      .nativeEnum(WorkEnvironment, {
        message: "Invalid term type",
      })
      .optional(),
  });

  const validationResult = RolesSearchParam.safeParse(searchParams);

  useEffect(() => {
    if (!validationResult.success) {
      toast({
        title: "JHFJHFJFJ",
        description: "FFFF"
        
      })
    }
  }, [])

  const reviews = api.review.list.useQuery({
    options: validationResult.success ? validationResult.data : {},
});

  const [selectedReview, setSelectedReview] = useState<ReviewType | undefined>(
    reviews.data ? reviews.data[0] : undefined,
  );


  return (
    <>
      <SearchFilter />
      {!validationResult.success && <ErrorBanner error={validationResult.error.issues.map(issue => issue.message).join(', ')} />}
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
