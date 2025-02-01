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

  const profile = api.profile.getCurrentUser.useQuery();

  const shouldShowOnboarding = session && !profile.data;

  const closeDialog = () => {
    setOpen(false);
  };

  if (profile.isPending || !shouldShowOnboarding) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] max-w-[85dvw] overflow-y-scroll rounded-lg p-8 lg:max-w-[70dvw] lg:p-12 xl:max-w-[60dvw]">
        <OnboardingForm userId={session.user.id} closeDialog={closeDialog} />
      </DialogContent>
    </Dialog>
  );
}
