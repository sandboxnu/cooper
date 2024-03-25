import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";

import localFont from "next/font/local";

// Font files can be colocated inside of `pages`
const myFont = localFont({
  src: [
    {
      path: "./../app/fonts/BentonSansBook.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./../app/fonts/BentonSansRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./../app/fonts/BentonSansMedium.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./../app/fonts/BentonSansBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
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
    <html className={myFont.variable} lang="en" suppressHydrationWarning>
      <body
        className={cn("min-h-screen bg-cooper-blue-200 font-sans antialiased")}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
