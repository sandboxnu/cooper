import { CustomToaster } from "@cooper/ui";

import HeaderLayout from "~/app/_components/header/header-layout";
import OnboardingWrapper from "~/app/_components/onboarding/onboarding-wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderLayout>
      <OnboardingWrapper>
        {children}
        <CustomToaster />
      </OnboardingWrapper>
    </HeaderLayout>
  );
}
