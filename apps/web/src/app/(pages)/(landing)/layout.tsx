import { redirect } from "next/navigation";
import { CustomToaster } from "@cooper/ui";

import HeaderLayout from "~/app/_components/header/header-layout";
import OnboardingWrapper from "~/app/_components/onboarding/onboarding-wrapper";
import { auth } from "@cooper/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session) {
    redirect("/roles");
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
