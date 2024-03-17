import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";

import localFont from "next/font/local";

const bentonSans = localFont({ src: "./fonts/BentonSansRegular.otf" });

export const metadata = {
  title: "Cooper",
  description: "Co-op Evaluation Resource",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          bentonSans.className,
        )}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
