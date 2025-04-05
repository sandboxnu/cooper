"use client";

import Image from "next/image";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";

import { locationName } from "~/utils/locationHelpers";
import {
  abbreviatedWorkTerm,
  prettyWorkEnviornment,
} from "~/utils/stringHelpers";
import { ReviewCardStars } from "./review-card-stars";

interface ReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCard({ reviewObj, className }: ReviewCardProps) {
  return (
    <Card
      className={cn(
        "mx-auto min-h-40 w-[100%] border-[0.75px] border-cooper-gray-400 bg-cooper-gray-100",
        className,
      )}
    >
      <div className="flex w-full pt-5">
        <div className="h-40 w-[35%]">
          <CardContent className="flex h-full flex-col justify-between pr-0">
            <div>
              <div className="pt-2">
                <ReviewCardStars numStars={reviewObj.overallRating} />
              </div>
              <div className="align-center flex flex-wrap gap-x-2 pt-2">
                <span
                  className={`${locationName(reviewObj) ? "visibility: visible" : "visibility: hidden"}`}
                >
                  {locationName(reviewObj)} •
                </span>
                <span>
                  {abbreviatedWorkTerm(reviewObj.workTerm)} {reviewObj.workYear}
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm">
                {reviewObj.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2 text-sm">
                Posted by: Anonymous{" "}
                <div className="cursor-pointer text-sm font-black">?</div>
              </div>
            </div>
          </CardContent>
        </div>
        <div className="w-[65%]">
          <CardContent className="flex h-full flex-col justify-between gap-4 pl-0">
            <div className="pt-1">{reviewObj.textReview}</div>
            <div className="flex justify-between text-sm">
              <div className="flex gap-6">
                <div>Position type: Co-op</div>
                <div>
                  Work model:{" "}
                  {prettyWorkEnviornment(
                    reviewObj.workEnvironment as WorkEnvironmentType,
                  )}
                </div>
                <div>Pay: ${reviewObj.hourlyPay} / hr</div>
              </div>

              <Image
                src="/svg/reviewReport.svg"
                alt="Star icon"
                width={16}
                height={15}
                className="cursor-pointer"
              />
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
