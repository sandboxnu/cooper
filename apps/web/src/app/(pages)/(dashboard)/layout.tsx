import { auth } from "@cooper/auth";
import { CustomToaster } from "@cooper/ui";
import { redirect } from "next/navigation";

import HeaderLayout from "~/app/_components/header/header-layout";
import OnboardingWrapper from "~/app/_components/onboarding/onboarding-wrapper";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <HeaderLayout>
      <OnboardingWrapper>
        {children}
        <CustomToaster />
      </OnboardingWrapper>
    </HeaderLayout>
  );
}
