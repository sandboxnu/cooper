import HeaderLayout from "~/app/_components/header-layout";
import { OnboardingWrapper } from "~/app/_components/onboarding/onboarding-wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderLayout>
      <OnboardingWrapper>{children}</OnboardingWrapper>
    </HeaderLayout>
  );
}
