"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CompanyType } from "@cooper/db/schema";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";

import { CompanyHeader } from "./company-overview";
import { CompanyOverviewRow } from "./company-page-content";

interface CompanyPopupProps {
  trigger?: React.ReactNode;
  company: CompanyType;
}

export function CompanyPopup({
  trigger,
  company,
}: CompanyPopupProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {/* Mirrors the top of the company page: header, then the overview +
          roles row. Sized to its content; scrolls if taller than the screen */}
      <DialogContent className="flex max-h-[90dvh] w-[880px] max-w-[calc(100vw-32px)] flex-col gap-6 overflow-y-auto border border-[#eaeaea] bg-white p-6 pb-9 sm:max-w-[calc(100vw-32px)]">
        <DialogTitle className="sr-only">{company.name}</DialogTitle>
        {/* No header rating: the overview below leads with it */}
        <CompanyHeader
          company={company}
          onSeeFullDetails={() => {
            setOpen(false);
            // Keep "all" (neither Jobs nor Companies selected); only switch to
            // Companies when the list is showing jobs only
            const currentType = new URLSearchParams(window.location.search).get(
              "type",
            );
            const type =
              currentType === "roles" ? "companies" : (currentType ?? "all");
            router.push(`/roles/?company=${company.slug}&type=${type}`);
          }}
        />
        <CompanyOverviewRow
          company={company}
          boxed={false}
          onRoleSelect={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
