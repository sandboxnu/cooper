import "~/styles/globals.css";

import { Inter as FontSans } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
