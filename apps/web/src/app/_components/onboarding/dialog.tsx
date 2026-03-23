"use client";

import { useState } from "react";

import type { Session } from "@cooper/auth";
import { Dialog, DialogContent } from "@cooper/ui/dialog";

import { OnboardingForm } from "~/app/_components/onboarding/onboarding-form";
import { api } from "~/trpc/react";

interface OnboardingDialogProps {
  isOpen?: boolean;
  session: Session | null;
}

/**
 * OnboardingDialog component that handles user onboarding.
 * Implementation note: Use OnboardingWrapper to wrap the component and initiate the dialog.
 * @param isOpen - Whether the dialog is open
 * @param session - The current user session
 * @returns The OnboardingDialog component or null
 */
export function OnboardingDialog({
  isOpen = true,
  session,
}: OnboardingDialogProps) {
  const [open, setOpen] = useState<boolean>(isOpen);

  const profile = api.profile.getCurrentUser.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const backendFilters = {
    industries: undefined,
    locations: undefined,
    jobTypes: undefined,
    minPay: undefined,
    maxPay: undefined,
    ratings: undefined,
    workModels: undefined,
    overtimeWork: undefined,
    companyCulture: undefined,
  };

  const roles = api.roleAndCompany.list.useQuery({
    sortBy: "default",
    search: "",
    limit: 10,
    offset: 0,
    type: "all",
    filters: backendFilters,
  });

  const shouldShowOnboarding = session && !profile.data;

  const closeDialog = () => {
    setOpen(false);
  };

  if (profile.isPending || !shouldShowOnboarding || roles.isPending) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-h-[90dvh] max-w-[85dvw] overflow-y-auto rounded-lg md:max-w-[70dvw] lg:max-w-[46rem]"
        aria-describedby="The form to create a Cooper profile once you have logged in with a husky google account."
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <OnboardingForm
          userId={session.user.id}
          closeDialog={closeDialog}
          session={session}
        />
      </DialogContent>
    </Dialog>
  );
}
