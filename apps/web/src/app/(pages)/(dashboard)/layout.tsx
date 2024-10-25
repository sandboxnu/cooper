import HeaderLayout from "~/app/_components/header-layout";
import { Toaster } from "@cooper/ui/toaster"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeaderLayout>{children}<Toaster /></HeaderLayout>;
}
