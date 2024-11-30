"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import type { Session } from "@cooper/auth";
import { Button } from "@cooper/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@cooper/ui/dialog";

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

  const shouldShowSignIn = !session;
  const shouldShowOnboarding = session && !profile.data;

  const closeDialog = () => {
    setOpen(false);
  };

  if (profile.isPending) {
    return null;
  }

  if (!shouldShowOnboarding && !shouldShowSignIn) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-12 sm:max-w-[720px]">
        {shouldShowSignIn && <SignInWithGooglePrompt />}
        {shouldShowOnboarding && (
          <OnboardingForm userId={session.user.id} closeDialog={closeDialog} />
        )}
      </DialogContent>
    </Dialog>
  );
}

const SignInWithGooglePrompt = () => {
  const handleGoogleSignIn = () => {
    void signIn("google");
  };

  return (
    <>
      <DialogTitle className="pb-4 text-center text-2xl font-bold text-cooper-blue-600">
        Login
      </DialogTitle>
      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-2 border-none bg-white text-gray-700 hover:bg-gray-100"
        >
          <svg
            className="h-5 w-5"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 488 512"
          >
            <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
          </svg>
          Sign in with Google
        </Button>
      </div>
    </>
  );
};
