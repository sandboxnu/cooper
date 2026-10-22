"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";
import { ReviewViewEditModal } from "~/app/_components/reviews/review-view-edit-modal";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from "../shared/menu-styles";

interface Props {
  review: ReviewType;
  trigger: ReactNode;
}

// Published reviews only offer Delete; drafts keep Edit since the menu is the
// only way back into a draft
export function ReviewActionsDialog({ review, trigger }: Props) {
  const isDraft = review.status === "DRAFT";

  const [editOpen, setEditOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("edit");
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      {/* Non-modal so the dialogs can take focus once the menu closes */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
          {isDraft && (
            <DropdownMenuItem
              className={MENU_ITEM_CLASS}
              onSelect={() => {
                setModalMode("edit");
                setEditOpen(true);
              }}
            >
              Edit draft
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className={cn(MENU_ITEM_CLASS, "text-[#f7784e]")}
            onSelect={() => setDeleteOpen(true)}
          >
            {isDraft ? "Delete draft" : "Delete review"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteReviewDialog
        reviewId={review.id}
        isDraft={isDraft}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      {isDraft && (
        <ReviewViewEditModal
          reviewId={review.id}
          mode={modalMode}
          open={editOpen}
          onOpenChange={setEditOpen}
          onModeChange={setModalMode}
        />
      )}
    </>
  );
}
