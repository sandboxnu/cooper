"use client";

import { cn } from "@cooper/ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ProfileTabs({ numReviews }: { numReviews: number }) {
  const tabs = [
    { name: "Saved roles", value: "saved-roles" },
    { name: "Saved companies", value: "saved-companies" },
    { name: "My reviews", value: "my-reviews" },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = searchParams.get("tab") || "saved-roles";

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  };

  return (
    <nav
      className="-mb-px flex flex-col sm:flex-row sm:space-x-4"
      aria-label="Tabs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => {
            router.push(`${pathname}?${createQueryString("tab", tab.value)}`);
          }}
          className={cn(
            tab.value === currentTab
              ? "border-primary-500 light:text-primary-600 dark:text-primary-300"
              : "light:text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700 dark:text-slate-300 dark:hover:text-gray-400",
            "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap",
          )}
        >
          {tab.name} {tab.name === "My reviews" ? "(" + numReviews + ")" : ""}
        </button>
      ))}
    </nav>
  );
}
