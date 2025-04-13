// components/MobileHeaderButton.tsx
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@cooper/ui/button";

interface MobileHeaderButtonProps {
  href?: string;
  iconSrc?: string;
  label?: string;
  children?: React.ReactNode;
}

export default function MobileHeaderButton({
  href,
  iconSrc,
  label = "",
  children,
}: MobileHeaderButtonProps) {
  const path = usePathname();
  const button = (
    <Button
      type="button"
      variant="outline"
      className="my-1 h-20 w-20 flex-col border-cooper-blue-600 text-sm text-cooper-blue-600"
    >
      {iconSrc && <Image src={iconSrc} width={32} height={32} alt={label} />}
      {children}
      {label}
    </Button>
  );

  return (
    <div className="relative items-center justify-center">
      {path === href && (
        <Image
          src="/svg/hidingLogo.svg"
          alt="Selected"
          width={80}
          height={80}
          className="absolute -top-6 z-10 -translate-y-2"
        />
      )}
      {href ? <Link href={href}>{button}</Link> : button}
    </div>
  );
}
