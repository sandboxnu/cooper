"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { ReviewType } from "@cooper/db/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@cooper/ui/popover";

import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";

type Props = {
  review: ReviewType;
  trigger: ReactNode;
};

export function ReviewActionsDialog({ review, trigger }: Props) {
  const router = useRouter();
  const isDraft = review.status === "DRAFT";

  const onView = () => {
    router.push(`/review-form?mode=view&reviewId=${review.id}`);
  };

  const onEdit = () => {
    router.push(`/review-form?mode=edit&reviewId=${review.id}`);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-[160px] p-2 bg-[#f7f7f7] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-lg border-none"
        align="start"
        sideOffset={4}
      >
        <button
          className="flex w-full items-center rounded-md bg-[#ebeae2] px-2.5 py-1.5 text-[14px] font-medium text-[#333] text-left tracking-[-0.14px] whitespace-nowrap"
          onClick={onView}
        >
          {isDraft ? "View Draft" : "View Review"}
        </button>
        <button
          className="flex w-full items-center rounded-md px-2.5 py-1.5 text-[14px] font-medium text-[#333] text-left tracking-[-0.14px] whitespace-nowrap hover:bg-[#ebeae2]"
          onClick={onEdit}
        >
          {isDraft ? "Edit Draft" : "Edit Review"}
        </button>
        <DeleteReviewDialog
          reviewId={review.id}
          trigger={
            <button className="flex w-full items-center rounded-md px-2.5 py-1.5 text-[14px] font-medium text-[#f7784e] text-left tracking-[-0.14px] whitespace-nowrap hover:bg-red-50">
              {isDraft ? "Delete Draft" : "Delete Review"}
            </button>
          }
          isDraft={isDraft}
        />
      </PopoverContent>
    </Popover>
  );
}
