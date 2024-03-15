import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { cn } from "~/lib/utils";

import localFont from "next/font/local";

// Font files can be colocated inside of `pages`
const myFont = localFont({
  src: [
    {
      path: "./fonts/BentonSansBook.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/BentonSansRegular.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/BentonSansMedium.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/BentonSansBold.otf",
      weight: "900",
      style: "normal",
    },
  ],
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
          myFont.className,
        )}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
