"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { ReviewType } from "@cooper/db/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@cooper/ui/popover";

import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";
import { ReviewViewEditModal } from "~/app/_components/reviews/review-view-edit-modal";

interface Props {
  review: ReviewType;
  trigger: ReactNode;
}

export function ReviewActionsDialog({ review, trigger }: Props) {
  const isDraft = review.status === "DRAFT";

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  const openModal = (mode: "view" | "edit") => {
    setPopoverOpen(false);
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent
          className="w-auto min-w-40 rounded-lg border-none bg-cooper-gray-100 p-2 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          align="start"
          sideOffset={4}
        >
          {!isDraft && (
            <button
              className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-[14px] font-medium tracking-[-0.14px] whitespace-nowrap text-cooper-gray-550 hover:bg-[#ebeae2]"
              onClick={() => openModal("view")}
            >
              View Review
            </button>
          )}
          <button
            className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm font-medium tracking-[-0.14px] whitespace-nowrap text-cooper-gray-550 hover:bg-[#ebeae2]"
            onClick={() => openModal("edit")}
          >
            {isDraft ? "Edit Draft" : "Edit Review"}
          </button>
          <DeleteReviewDialog
            reviewId={review.id}
            trigger={
              <button className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm font-medium tracking-[-0.14px] whitespace-nowrap text-[#f7784e] hover:bg-red-50">
                {isDraft ? "Delete Draft" : "Delete Review"}
              </button>
            }
            isDraft={isDraft}
          />
        </PopoverContent>
      </Popover>

      <ReviewViewEditModal
        reviewId={review.id}
        mode={modalMode}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onModeChange={setModalMode}
      />
    </>
  );
}
