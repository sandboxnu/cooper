import type { ReactNode } from "react";

import { auth } from "@cooper/auth";

import { OnboardingDialog } from "~/app/_components/onboarding/dialog";

interface OnboardingWrapperProps {
  children: ReactNode;
}

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
