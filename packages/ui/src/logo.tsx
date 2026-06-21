"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { CompanyType } from "../../db/src/schema/companies";
import { cn } from ".";

interface ILogoProps {
  className?: string;
  company: Omit<CompanyType, "slug"> & { slug?: string };
}

// A transient first-load failure (cold image optimizer, logo.dev rate limiting
// under a burst of requests) used to latch the fallback permanently. Allow one
// retry before giving up so the logo recovers without a full remount.
const MAX_LOGO_RETRIES = 1;

const Logo: React.FC<ILogoProps> = ({ company, className }) => {
  const rawWebsite = company.website;
  const website =
    rawWebsite && rawWebsite !== ""
      ? rawWebsite.replace(/^(https?:\/\/)/, "").replace(/\s/g, "")
      : `${company.name.replace(/\s/g, "")}.com`;
  const [imageError, setImageError] = useState(false);
  const [retries, setRetries] = useState(0);

  // Reset the failed state when the target logo changes (e.g. navigating
  // between companies) so a previous company's failure doesn't stick.
  useEffect(() => {
    setImageError(false);
    setRetries(0);
  }, [website]);

  return imageError ? (
    <div
      className={cn(
        "flex aspect-square max-h-20 min-h-16 min-w-16 max-w-20 items-center justify-center rounded-md bg-cooper-gray-200 text-4xl font-bold text-white",
        className,
      )}
    >
      {company.name.charAt(0)}
    </div>
  ) : (
    <Image
      key={`${website}-${retries}`}
      src={`https://img.logo.dev/${website}?token=pk_DNxGM2gHTjiLU3p79GX79A`}
      width={50}
      height={50}
      alt={`Logo of ${company.name}`}
      className={cn(`h-[50px] w-[50px] rounded-lg`, className)}
      onError={() => {
        if (retries < MAX_LOGO_RETRIES) {
          setRetries((r) => r + 1);
        } else {
          setImageError(true);
        }
      }}
    />
  );
};

export default Logo;
