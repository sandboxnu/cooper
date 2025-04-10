"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@cooper/ui";

import { NewReviewDialog } from "./reviews/new-review-dialogue";
import SearchFilter from "./search/search-filter";

interface MobileHeaderProps {
  auth: React.ReactNode;
}

export default function MobileHeader({ auth }: MobileHeaderProps) {
  const pathname = usePathname();

  return <div className="md:hidden"></div>;
}
