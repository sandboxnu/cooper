"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from "../shared/menu-styles";
import { ReportDialog } from "../shared/report-button";

// Three-dots menu for a role, matching the one on review cards. ownReviewId is
// the current user's review of this role, if they wrote one.
export function RoleOptionsMenu({
  roleId,
  ownReviewId,
}: {
  roleId: string;
  ownReviewId?: string;
}) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      {/* Non-modal so the report dialog can take focus once it closes */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-label="Role options"
          // Same height as the save button so the icons center on one line
          className="flex h-6 shrink-0 items-center outline-none"
        >
          {/* The svg's dots sit 2px below its center, so nudge them up */}
          <Image
            src="/svg/reviewMenu.svg"
            alt=""
            width={6}
            height={22}
            className="-translate-y-0.5"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={MENU_CONTENT_CLASS}>
          {ownReviewId && (
            <DropdownMenuItem asChild className={MENU_ITEM_CLASS}>
              <Link href={`/profile?tab=my-reviews&review=${ownReviewId}`}>
                View or edit on profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className={MENU_ITEM_CLASS}
            onSelect={() => setReportOpen(true)}
          >
            Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReportDialog
        entityType="role"
        entityId={roleId}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </>
  );
}
