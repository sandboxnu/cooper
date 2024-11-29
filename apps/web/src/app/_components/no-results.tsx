"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "@cooper/ui/button";

import CooperLogo from "./cooper-logo";

export default function NoResults() {
  const router = useRouter();
  const pathname = usePathname();

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <section className="flex h-[50dvh] w-full flex-col items-center justify-center">
      <CooperLogo width={200} />
      <div className="flex flex-col items-center rounded-lg border-2 border-cooper-blue-600 px-16 pb-4 pt-6 text-xl font-bold">
        <h2 className="text-cooper-blue-700">No Results Found</h2>
        <Button
          type="button"
          variant="ghost"
          onClick={clearFilters}
          className="text-cooper-blue-600"
        >
          Clear Filters
        </Button>
      </div>
    </section>
  );
}
