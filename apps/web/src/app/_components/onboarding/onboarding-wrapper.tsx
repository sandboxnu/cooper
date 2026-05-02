import type { ReactNode } from "react";

import { getSession } from "@cooper/auth";

import { OnboardingDialog } from "~/app/_components/onboarding/dialog";

interface OnboardingWrapperProps {
  children: ReactNode;
}

export default async function OnboardingWrapper({
  children,
}: OnboardingWrapperProps) {
  const session = await getSession();

  return (
    <>
      {children}
      <OnboardingDialog session={session} />
    </>
  );
}
