"use client";

import { useState } from "react";
import Image from "next/image";

import type { CompanyType } from "../../db/src/schema/companies";
import { cn } from ".";

interface ILogoProps {
  className?: string;
  company: CompanyType;
  size?: "small" | "default" | "medium";
}

const Logo: React.FC<ILogoProps> = ({ company, size, className }) => {
  const rawWebsite = company.website;
  const website =
    rawWebsite && rawWebsite !== ""
      ? rawWebsite.replace(/^(https?:\/\/)/, "")
      : `${company.name.replace(/\s/g, "")}.com`;
  const [imageError, setImageError] = useState(false);
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
      src={`https://img.logo.dev/${website}?token=pk_DNxGM2gHTjiLU3p79GX79A`}
      width={80}
      height={80}
      alt={`Logo of ${company.name}`}
      className={cn(
        `${size === "small" ? "" : size === "medium" ? "h-50 w-50" : "h-20 w-20"} rounded-lg`,
        className,
      )}
      onError={() => setImageError(true)}
    />
  );
};

export default Logo;
