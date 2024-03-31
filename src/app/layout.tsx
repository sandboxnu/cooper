import "~/styles/globals.css";
import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";
import { bentonSansFont } from "~/styles/font";

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
    <html
      className={bentonSansFont.variable}
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn("min-h-screen bg-white font-sans antialiased")}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
