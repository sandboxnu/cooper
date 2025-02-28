import localFont from "next/font/local";

export const hankenGroteskFont = localFont({
  src: [
    {
      path: "./../../../public/fonts/hanken-grotesk/HankenGrotesk-Light.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/hanken-grotesk/HankenGrotesk-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/hanken-grotesk/HankenGrotesk-Medium.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/hanken-grotesk/HankenGrotesk-Bold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});
