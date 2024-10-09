"use client";

import { useEffect, useState } from "react";

import {
  ReviewType,
  WorkEnvironmentType,
  WorkTermType,
  WorkTerm,
  WorkEnvironment
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
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const isValidTerm = searchParams?.workTerm
      ? Object.values(WorkTerm).includes(searchParams.workTerm)
      : true; 

    const isValidEnvironment = searchParams?.workEnvironment
      ? Object.values(WorkEnvironment).includes(searchParams.workEnvironment)
      : true; 

    if (!isValidTerm) {
      setError("Invalid work term.");
    } else if (!isValidEnvironment) {
      setError("Invalid work environment.");
    } 
  }, [searchParams]);



  const reviews = api.review.list.useQuery({
    options: {
      cycle: searchParams?.workTerm,
      term: searchParams?.workEnvironment,
    },
  });

  const [selectedReview, setSelectedReview] = useState<ReviewType | undefined>(
    reviews.data ? reviews.data[0] : undefined,
  );

  const [showAlert, setShowAlert] = useState(true);

  return (
    <>
      <SearchFilter />
      {/* TODO: Loading animations */}
      {error && showAlert &&
      <div id="bad-input" className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
          </svg>
          <span className="sr-only">Error icon</span>
      </div>
      <div className="ms-3 text-sm font-normal">{error}</div>
      <button type="button" className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#bad-input" aria-label="Close" onClick={() => setShowAlert(false)}>
          <span className="sr-only">Close</span>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
      </button>
  </div>}
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
