"use client";

import Image from "next/image";

import type { ReviewType, RoleType } from "@cooper/db/schema";
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


interface RoleCardPreviewProps {
  className?: string;
  reviewObj: RoleType;
}

export function RoleCardPreview({
  className,
  reviewObj,
}: RoleCardPreviewProps) {
  // ===== COMPANY DATA ===== //
  const company = api.company.getById.useQuery({
    id: reviewObj.companyId,
  });

  // ===== ROLE DATA ===== //
  const role = api.role.getById.useQuery({ id: reviewObj.id });
  const reviews = api.review.getByRole.useQuery({id: reviewObj.id})

  const yellowStar = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="17"
      viewBox="0 0 19 17"
      fill="none"
    >
      <path
        d="M8.57668 1.21993C8.91827 0.398637 10.0817 0.398636 10.4233 1.21993L12.0427 5.11343C12.1867 5.45967 12.5123 5.69624 12.8861 5.72621L17.0895 6.06319C17.9761 6.13427 18.3357 7.24078 17.6601 7.81945L14.4576 10.5627C14.1728 10.8067 14.0485 11.1895 14.1355 11.5542L15.1139 15.656C15.3203 16.5212 14.379 17.2051 13.6199 16.7414L10.0213 14.5434C9.70124 14.3479 9.29876 14.3479 8.97875 14.5434L5.38008 16.7414C4.62098 17.2051 3.67973 16.5212 3.88611 15.656L4.86454 11.5542C4.95154 11.1895 4.82717 10.8067 4.54238 10.5627L1.33986 7.81945C0.664326 7.24078 1.02385 6.13427 1.91051 6.06319L6.11387 5.72621C6.48766 5.69624 6.81327 5.45967 6.95728 5.11343L8.57668 1.21993Z"
        fill="#FFA400"
      />
    </svg>
  );

  return (
    <Card
      className={cn(
        "flex h-34 w-[100%] flex-col justify-between overflow-hidden rounded-2xl outline outline-[0.75px] outline-[#474747]",
        className,
      )}
    >
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-start space-x-4">
            <div>
              <CardTitle>
                <div className="flex items-center gap-3 text-md md:text-xl">
                  <div>
                  {role.data?.title}
                  </div>
                  <div className="font-normal text-sm">
                  Co-op
                  </div>
                </div>

              </CardTitle>
              <div className="flex align-center gap-2">
                <span>{company.data?.name}</span>
                {reviews.isSuccess && reviews.data.length > 0 && <span className={`${reviews.data[0]?.location ? "visibility: visible" : "visibility: hidden"}`}>•</span>}
                {reviews.isSuccess && reviews.data.length > 0 && <span>{reviews.data[0]?.location}</span> }
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2">
        {reviews.isSuccess && reviews.data.length > 0 && (() => {
          const totalRating = reviews.data.reduce((sum, review) => sum + review.overallRating, 0);
          const averageRating = (totalRating / reviews.data.length).toFixed(1);

          return (
            <div className="flex align-center gap-2">
              {yellowStar} {averageRating} ({reviews.data.length} reviews)
            </div>
          );
        })()}
          
        </CardContent>
      </div>
    </Card>
  );
}
