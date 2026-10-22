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

import { CompanyOverview } from "./company-overview";

interface CompanyPopupProps {
  trigger?: React.ReactNode;
  company: CompanyType;
  locations?: (string | null)[];
}

export function CompanyPopup({
  trigger,
  company,
  locations,
}: CompanyPopupProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex h-[553px] max-h-[90dvh] w-[913px] max-w-[95vw] flex-col overflow-y-auto border border-[#eaeaea] bg-white p-6 sm:max-w-[95vw] md:overflow-hidden">
        <DialogTitle className="sr-only">{company.name}</DialogTitle>
        <CompanyOverview
          company={company}
          locations={locations}
          className="min-h-0 flex-1"
          onSeeFullDetails={() => {
            setOpen(false);
            router.push(`/roles/?company=${company.slug}&type=companies`);
          }}
          onRoleSelect={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
