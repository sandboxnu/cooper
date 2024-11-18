"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@cooper/ui/button";

export default function NoResults() {
  const router = useRouter();
  const pathname = usePathname();

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <section className="flex h-20 h-[50dvh] w-full flex-col items-center justify-center">
      <Image
        src="/svg/hidingLogo.svg"
        height={200}
        width={200}
        alt="Logo Picture"
      />
      <div className="rounded-lg border-2 border-cooper-blue-600 px-16 pb-4 pt-6 text-xl font-bold text-cooper-blue-700">
        <h2 className="">No Results Found</h2>
        <Button type="button" variant="ghost" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </section>
  );
}
