import Image from "next/image";

interface CooperLogoProps {
  width?: number;
}

export default function CooperLogo({ width }: CooperLogoProps) {
  return (
    <Image
      src="/svg/hidingLogo.svg"
      width={width ?? 137}
      height={width ? width / 2.28 : 60} // 2.28 is the approximate ratio in the hidingLogo.svg file 
      alt="Logo Picture"
    />
  );
}
