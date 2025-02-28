import Image from "next/image";

interface CooperLogoProps {
  width?: number;
}

export default function CooperLogo({ width }: CooperLogoProps) {
  return (
    <Image
      src="/svg/logoOutline.svg"
      width={width ?? 80}
      height={width ? width / 1.17 : 70}
      alt="Logo Picture"
    />
  );
}
