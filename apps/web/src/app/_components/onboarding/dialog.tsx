"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import type { Session } from "@cooper/auth";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@cooper/ui/dialog";

import { api } from "~/trpc/react";
import { OnboardingForm } from "./onboarding-form";

interface OnboardingDialogProps {
  isOpen: boolean;
  session: Session | null;
}

export function OnboardingDialog({ isOpen, session }: OnboardingDialogProps) {
  const [open, setOpen] = useState<boolean>(isOpen);

  const profile = api.profile.getCurrentUser.useQuery();

  const shouldShowSignIn = !session;
  const shouldShowOnboarding = session && !profile.data;

  if ((!shouldShowOnboarding && !shouldShowSignIn) || profile.isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-12 sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="pb-4 text-center text-2xl font-bold text-cooper-blue-600">
            {session ? "Create a Cooper Account" : "Login"}
          </DialogTitle>
        </DialogHeader>
        {shouldShowSignIn && <SignInWithGoogleButton />}
        {shouldShowOnboarding && <OnboardingForm userId={session.user.id} />}
      </DialogContent>
    </Dialog>
  );
}

const SignInWithGoogleButton = () => {
  const handleGoogleSignIn = () => {
    void signIn("google");
  };

  return (
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
  );
};
