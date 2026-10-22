"use client";

import { useState } from "react";
import Image from "next/image";

import type { CompanyType } from "../../db/src/schema/companies";
import { cn } from ".";

interface ILogoProps {
  className?: string;
  company: Omit<CompanyType, "slug"> & { slug?: string };
}

const Logo: React.FC<ILogoProps> = ({ company, className }) => {
  const rawWebsite = company.website;
  const website =
    rawWebsite && rawWebsite !== ""
      ? rawWebsite.replace(/^(https?:\/\/)/, "")
      : `${company.name.replace(/\s/g, "")}.com`;
  const src = `https://img.logo.dev/${website}?token=pk_DNxGM2gHTjiLU3p79GX79A`;
  // Remember which URL failed, so a reused Logo (e.g. the company header when
  // switching companies) doesn't keep the previous company's error
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  return failedSrc === src ? (
    <div
      className={cn(
        // Same box as the logo image below so both sizes match wherever used
        "flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-lg bg-cooper-gray-200 text-2xl font-bold text-white",
        className,
      )}
    >
      {company.name.charAt(0)}
    </div>
  ) : (
    <Image
      src={src}
      width={50}
      height={50}
      alt={`Logo of ${company.name}`}
      className={cn(`h-[50px] w-[50px] rounded-lg`, className)}
      onError={() => setFailedSrc(src)}
    />
  );
};

export default Logo;
