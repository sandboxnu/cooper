"use client";

import { useState } from "react";
import Image from "next/image";
import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import { Card, CardContent } from "@cooper/ui/card";
import { prettyLocationName } from "~/utils/locationHelpers";
import { api } from "~/trpc/react";
import { GrayStar } from "./review-card-stars";
import { formatLastEditedDate } from "~/utils/dateHelpers";
import { LIST_CARD_HEIGHT_CLASS } from "../shared/card-height";
import { ReviewActionsDialog } from "./review-actions-dialogue";
import { ReviewViewEditModal } from "./review-view-edit-modal";
import { MoreVertical } from "lucide-react";

interface DraftReviewCardProps {
  className?: string;
  reviewObj: ReviewType;
}

export function DraftReviewCard({
  reviewObj,
  className,
}: DraftReviewCardProps) {
  const { data: role } = api.role.getById.useQuery(
    { id: reviewObj.roleId ?? "" },
    { enabled: !!reviewObj.roleId },
  );

  const { data: location } = api.location.getById.useQuery(
    { id: reviewObj.locationId ?? "" },
    { enabled: !!reviewObj.locationId },
  );

  const { data: company } = api.company.getById.useQuery(
    { id: reviewObj.companyId ?? "" },
    { enabled: !!reviewObj.companyId },
  );

  const trimmedTitle = role?.title.trim();
  // Empty titles count as missing, so the placeholder shows
  const roleTitle = trimmedTitle?.length ? trimmedTitle : undefined;
  const [editOpen, setEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("edit");
  const locationLabel = location ? prettyLocationName(location) : "";
  // Gray placeholder text stands in for anything not filled in yet
  const placeholderClass = "text-black/40";

  // Same layout as ProfileReviewCard; only the colors and placeholders differ
  return (
    <>
      <Card
        className={cn(
          "border-cooper-gray-150 mx-auto w-full cursor-pointer border-[0.75px] bg-[#FEFEFE] hover:bg-[#FEFEFE]",
          LIST_CARD_HEIGHT_CLASS,
          className,
        )}
        onClick={(event) => {
          // Ignore the actions menu: its button, and its portaled items and
          // dialogs (React events bubble through portals)
          const target = event.target as Node;
          if (!event.currentTarget.contains(target)) return;
          if (target instanceof Element && target.closest("button")) return;
          // Drafts open straight into editing
          setModalMode("edit");
          setEditOpen(true);
        }}
      >
        <CardContent className="flex flex-col gap-2">
          {/* Top row; on mobile the title can wrap, so keep the rating at the
            top instead of centered */}
          <div className="flex items-start justify-between gap-2 md:items-center">
            <div className="flex min-w-0 flex-col">
              <div className="flex min-w-0 items-center gap-x-3">
                <span
                  className={cn(
                    "font-hanken truncate text-xl leading-7 text-black",
                    !roleTitle && placeholderClass,
                  )}
                >
                  {roleTitle ?? "Job title"}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-base text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Draft
                </span>
              </div>
              <span className="truncate text-[16px] leading-6 tracking-[-0.16px] text-[#7c7e7e]">
                <span className={cn(!company?.name && placeholderClass)}>
                  {company?.name ?? "Company name"}
                </span>
                {"  •  "}
                <span className={cn(!locationLabel && placeholderClass)}>
                  {locationLabel || "Location"}
                </span>
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 opacity-80">
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "font-hanken text-xl leading-7 text-black md:text-2xl",
                    !reviewObj.overallRating && placeholderClass,
                  )}
                >
                  {(reviewObj.overallRating ?? 0).toFixed(1)}
                </span>
                {reviewObj.overallRating ? (
                  <Image
                    src="/svg/star.svg"
                    alt="Star icon"
                    width={28}
                    height={28}
                    className="h-5 w-5 md:h-7 md:w-7"
                  />
                ) : (
                  <GrayStar className="h-5 w-5 md:h-7 md:w-7" />
                )}
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
          <span className="text-sm text-[#7c7e7e]">
            {formatLastEditedDate(reviewObj.updatedAt, reviewObj.createdAt)}
          </span>
        </CardContent>
      </Card>
      <ReviewViewEditModal
        reviewId={reviewObj.id}
        mode={modalMode}
        open={editOpen}
        onOpenChange={setEditOpen}
        onModeChange={setModalMode}
      />
    </>
  );
}
