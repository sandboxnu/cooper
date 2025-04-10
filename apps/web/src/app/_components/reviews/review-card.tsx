"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";

import type { ReviewType, WorkEnvironmentType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { Card, CardContent } from "@cooper/ui/card";
import { useToast } from "@cooper/ui/hooks/use-toast";

import { api } from "~/trpc/react";
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
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get the current user's profile
  const { data: currentProfile } = api.profile.getCurrentUser.useQuery();

  // Check if the current user is the author of the review
  const isAuthor = currentProfile?.id === reviewObj.profileId;

  // Delete mutation
  const deleteReview = api.review.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      });
      // Refresh the page to update the UI
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      setIsDeleting(true);
      deleteReview.mutate(reviewObj.id);
    }
  };

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
            <div className="flex flex-row justify-between">
              <div className="pt-1">{reviewObj.textReview}</div>
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="pr-5 text-cooper-gray-400 hover:bg-transparent hover:text-red-500"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="-mt-1 h-4 w-4" />
                </Button>
              )}
            </div>

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
