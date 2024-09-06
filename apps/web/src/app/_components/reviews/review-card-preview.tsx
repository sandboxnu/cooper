"use client";

import Image from "next/image";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@cooper/ui/card";

import { ReviewCardStars } from "~/app/_components/reviews/review-card-stars";
import { api } from "~/trpc/react";
import { truncateText } from "~/utils/stringHelpers";

// todo: add this attribution in a footer somewhere
//  <a href="https://clearbit.com">Logos provided by Clearbit</a>

interface ReviewCardPreviewProps {
  className?: string;
  reviewObj: ReviewType;
}

export function ReviewCardPreview({
  className,
  reviewObj,
}: ReviewCardPreviewProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({
    id: reviewObj.companyId,
  });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: reviewObj.roleId });

  // Truncate Review Text
  const reviewText = truncateText(reviewObj.textReview, 80);

  return (
    <Card
      className={cn(
        "flex h-64 w-[100%] flex-col justify-between overflow-hidden rounded-3xl",
        className,
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-start space-x-4">
            {company.data ? (
              <Image
                src={`https://logo.clearbit.com/${company.data.name.replace(/\s/g, "")}.com`}
                width={50}
                height={50}
                alt={`Logo of ${company.data.name}`}
                className="rounded-xl border"
              />
            ) : (
              <div className="h-[50px] w-[50px] rounded-xl border bg-cooper-blue-200"></div>
            )}
            <div>
              <CardTitle className="text-md md:text-xl">
                {role.data?.title}
              </CardTitle>
              <p className="text-xs font-semibold md:text-sm">
                {company.data?.name}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
          <div>
            <h2 className="text-md font-semibold md:text-xl">
              {reviewObj.reviewHeadline}
            </h2>
            <ReviewCardStars numStars={reviewObj.overallRating} />
          </div>
          <p className="text-xs lg:text-sm">{reviewText}</p>
        </CardContent>
      </div>
      <CardFooter className="items-end justify-end text-xs italic">
        see more...
      </CardFooter>
    </Card>
  );
}
