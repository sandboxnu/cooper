import "~/styles/globals.css";
import HeaderLayout from "~/components/header-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeaderLayout>{children}</HeaderLayout>;
}
