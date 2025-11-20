"use client";

import { useState } from "react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";

import { api } from "~/trpc/react";
import ExistingCompanyContent from "./existing-company-content";
import NewCompanyContent from "./new-company-content";

interface NewReviewDialogProps {
  trigger?: React.ReactNode;
}

/**
 * General "+ New Review"
 *
 * @returns A "+ New Review" button that prompts users for a company + role before redirecting to the review form.
 */
export function NewReviewDialog({ trigger }: NewReviewDialogProps) {
  const session = api.auth.getSession.useQuery();

  const [companyMode, setCompanyMode] = useState<"existing" | "new">(
    "existing",
  );

  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id;

  const createdRoles =
    api.role.getByCreatedBy.useQuery(
      { createdBy: profileId ?? "" },
      { enabled: !!profileId },
    ).data ?? [];
  const createdRolesCount = createdRoles.length;

  if (!session.isSuccess && !session.data) {
    return;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? (
          <Button className="bg-cooper-cream-100 hover:bg-cooper-cream-100 m-0 -mt-2 border-none p-0 text-3xl font-thin text-black outline-none">
            {trigger}
          </Button>
        ) : (
          <Button className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700">
            <span className="translate-y-[-2px] text-2xl md:hidden">+</span>
            <span className="hidden md:inline">+ ADD REVIEW</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] w-[80dvw] overflow-y-scroll bg-white">
        <DialogHeader>
          <DialogTitle className="text-cooper-gray-900 flex flex-col items-center justify-between text-2xl font-semibold md:flex-row md:gap-12">
            New Review
            <div className="">
              <Button
                variant="link"
                className={cn(
                  "mr-4 px-0 py-0 text-cooper-gray-300 hover:no-underline md:text-lg",
                  companyMode === "existing" && "underline hover:underline",
                )}
                onClick={() => {
                  setCompanyMode("existing");
                }}
              >
                Existing Company
              </Button>
              {createdRolesCount < 4 && (
                <Button
                  variant="link"
                  className={cn(
                    "mr-2 px-0 py-0 text-cooper-gray-300 hover:no-underline md:text-lg",
                    companyMode === "new" && "underline hover:underline",
                  )}
                  onClick={() => {
                    setCompanyMode("new");
                  }}
                >
                  New Company
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        {companyMode === "existing" && (
          <ExistingCompanyContent
            createdRolesCount={createdRolesCount}
            profileId={profileId}
          />
        )}
        {companyMode === "new" && createdRolesCount < 4 && (
          <NewCompanyContent profileId={profileId} />
        )}
      </DialogContent>
    </Dialog>
  );
}
