import type { Metadata } from "next";

import { cn } from "@cooper/ui";

import { hankenGroteskFont } from "~/app/styles/font";
import { TRPCReactProvider } from "~/trpc/react";
import { CompareProvider } from "~/app/_components/compare/compare-context";

import "~/app/styles/globals.css";

import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://cooper-sandboxneu.vercel.app"
      : "http://localhost:3000",
  ),
  title: "Cooper",
  description: "A Co-op Review Platform",
  openGraph: {
    title: "Cooper",
    description: "A Co-op Review Platform",
    url: "https://cooper-sandboxneu.vercel.app",
    siteName: "Cooper",
  },
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      className={hankenGroteskFont.variable}
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={cn(
          "min-h-screen bg-cooper-cream-100 font-sans text-foreground antialiased",
        )}
      >
        <TRPCReactProvider>
          <CompareProvider>{props.children}</CompareProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
