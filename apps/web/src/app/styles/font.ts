import localFont from "next/font/local";

export const altivoFont = localFont({
  src: [
    {
      path: "./../../../public/fonts/AltivoRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/AltivoMedium.otf",
      weight: "600",
      style: "normal",
    },
  ],
});

export const bentonSansFont = localFont({
  src: [
    {
      path: "./../../../public/fonts/BentonSansBook.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/BentonSansRegular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/BentonSansMedium.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./../../../public/fonts/BentonSansBold.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
});
