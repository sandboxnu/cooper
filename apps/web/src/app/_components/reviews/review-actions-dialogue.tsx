"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

import type { ReviewType } from "@cooper/db/schema";
import { cn } from "@cooper/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";
import { api } from "~/trpc/react";
import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from "../shared/menu-styles";

interface Props {
  review: ReviewType;
  trigger: ReactNode;
}

// Published reviews link to their job and company pages; both offer Delete. Clicking the
// card itself opens the review (or draft)
export function ReviewActionsDialog({ review, trigger }: Props) {
  const isDraft = review.status === "DRAFT";

  // Same queries the card makes, so these come from the cache
  const { data: role } = api.role.getById.useQuery(
    { id: review.roleId ?? "" },
    { enabled: !isDraft && !!review.roleId },
  );
  const { data: company } = api.company.getById.useQuery(
    { id: review.companyId ?? "" },
    { enabled: !isDraft && !!review.companyId },
  );
  const jobHref =
    !isDraft && role && company
      ? `/roles/?company=${company.slug}&type=roles&role=${role.slug}`
      : null;
  const companyHref =
    !isDraft && company ? `/roles/?company=${company.slug}&type=companies` : null;

  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      {/* Non-modal so the dialogs can take focus once the menu closes */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={MENU_CONTENT_CLASS}>
          {jobHref && (
            <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
              <Link href={jobHref}>Go to job page</Link>
            </DropdownMenuItem>
          )}
          {companyHref && (
            <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
              <Link href={companyHref}>Go to company page</Link>
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
    </>
  );
}
