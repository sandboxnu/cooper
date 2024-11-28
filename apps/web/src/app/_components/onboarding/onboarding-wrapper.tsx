import type { ReactNode } from "react";

import { auth } from "@cooper/auth";

import { OnboardingDialog } from "~/app/_components/onboarding/dialog";

interface OnboardingWrapperProps {
  children: ReactNode;
}

/**
 * OnboardingWrapper component that wraps the app and initiates the onboarding dialog.
 * @param children - The children components
 * @returns The OnboardingWrapper component
 */
export default async function OnboardingWrapper({
  children,
}: OnboardingWrapperProps) {
  const session = await auth();

  return (
    <>
      {children}
      <OnboardingDialog session={session} />
    </>
  );
}
