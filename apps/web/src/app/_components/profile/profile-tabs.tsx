"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@cooper/ui";

export default function ProfileTabs({ numReviews }: { numReviews: number }) {
  const tabs = [
    { name: "Saved roles", value: "saved-roles" },
    { name: "Saved companies", value: "saved-companies" },
    { name: "My reviews", value: "my-reviews" },
  ];

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = searchParams.get("tab") ?? "saved-roles";

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  };

  return (
    <nav
      className="flex flex-col border-b sm:flex-row sm:space-x-4"
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
              ? "border-primary-500 border-[#151515] text-[#151515]"
              : "border-transparent text-[#5A5A5A] hover:border-gray-300 hover:text-gray-700",
            "flex items-center whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium",
          )}
        >
          {tab.name} {tab.name === "My reviews" ? "(" + numReviews + ")" : ""}
        </button>
      ))}
    </nav>
  );
}
