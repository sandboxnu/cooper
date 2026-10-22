"use client";

import { useState } from "react";
import Image from "next/image";
import { MoreVertical } from "lucide-react";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";

import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { LIST_CARD_HEIGHT_CLASS } from "../shared/card-height";
import { ReviewActionsDialog } from "./review-actions-dialogue";
import { ReviewViewEditModal } from "./review-view-edit-modal";

interface ProfileReviewCardProps {
  reviewObj: ReviewType;
  className?: string;
}

export function ProfileReviewCard({
  reviewObj,
  className,
}: ProfileReviewCardProps) {
  const { data: role } = api.role.getById.useQuery(
    { id: reviewObj.roleId ?? "" },
    { enabled: !!reviewObj.roleId },
  );
  const { data: company } = api.company.getById.useQuery(
    { id: reviewObj.companyId ?? "" },
    { enabled: !!reviewObj.companyId },
  );
  const { data: location } = api.location.getById.useQuery(
    { id: reviewObj.locationId ?? "" },
    { enabled: !!reviewObj.locationId },
  );

  const [viewOpen, setViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit">("view");

  const locationLabel = prettyLocationName(location);
  const subtitle = [company?.name, locationLabel].filter(Boolean).join("  •  ");

  const reviewedDate = new Date(reviewObj.createdAt).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
  return (
    <>
      <Card
        className={cn(
          "w-full border mx-auto bg-white cursor-pointer",
          LIST_CARD_HEIGHT_CLASS,
          className,
        )}
        onClick={(event) => {
          // Ignore the actions menu: its button, and its portaled items and
          // dialogs (React events bubble through portals)
          const target = event.target as Node;
          if (!event.currentTarget.contains(target)) return;
          if (target instanceof Element && target.closest("button")) return;
          setViewMode("view");
          setViewOpen(true);
        }}
      >
        <CardContent className="flex flex-col gap-2">
          {/* Top row; on mobile the title can wrap, so keep the rating at the
              top instead of centered */}
          <div className="flex items-start justify-between gap-2 md:items-center">
            <div className="flex min-w-0 flex-col">
              <span className="font-hanken truncate text-xl leading-7 text-black">
                {role?.title ?? "—"}
              </span>
              <span className="truncate text-[16px] leading-6 tracking-[-0.16px] text-[#7c7e7e]">
                {subtitle}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 opacity-80">
              <div className="flex items-center gap-1">
                <span className="font-hanken text-xl md:text-2xl leading-7 text-black">
                  {reviewObj.overallRating?.toFixed(1) ?? "—"}
                </span>
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={28}
                  height={28}
                  className="h-5 w-5 md:h-7 md:w-7"
                />
              </div>
              <ReviewActionsDialog
                review={reviewObj}
                trigger={
                  <button
                    type="button"
                    // -mr-2 pulls the icon toward the card's right edge
                    className="-mr-2 flex items-center justify-center rounded-full p-1"
                  >
                    <MoreVertical className="h-5 w-5 text-cooper-gray-350" />
                  </button>
                }
              />
            </div>
          </div>

          {/* Bottom row */}
          {reviewedDate && (
            <span className="text-sm text-[#7c7e7e]">
              Reviewed on {reviewedDate}
            </span>
          )}
        </CardContent>
      </Card>
      <ReviewViewEditModal
        reviewId={reviewObj.id}
        mode={viewMode}
        open={viewOpen}
        onOpenChange={setViewOpen}
        onModeChange={setViewMode}
      />
    </>
  );
}
