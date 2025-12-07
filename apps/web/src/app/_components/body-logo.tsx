import Image from "next/image";

interface CooperLogoProps {
  width?: number;
}

export default function BodyLogo({ width }: CooperLogoProps) {
  return (
    <Image
      src="/svg/bodyLogo.svg"
      width={width ?? 80}
      height={width ? width / 1.17 : 70}
      alt="Logo Picture"
      priority
    />
  );
}
