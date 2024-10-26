import { Toaster } from "@cooper/ui/toaster";

import HeaderLayout from "~/app/_components/header-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderLayout>
      {children}
      <Toaster />
    </HeaderLayout>
  );
}
