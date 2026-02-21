"use client";

import { useState } from "react";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";

import { FavoriteButton } from "../shared/favorite-button";
import RenderAllRoles from "./all-company-roles";
import { CompanyAbout } from "./company-about";
import { CompanyReview } from "./company-reviews";
import Logo from "node_modules/@cooper/ui/src/logo";
import { CompanyType } from "@cooper/db/schema";

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          <Button className="bg-cooper-cream-100 text-md hover:bg-cooper-cream-100 h-auto border-none !p-0 !py-0 text-cooper-gray-400 outline-none hover:underline">
            {trigger}
          </Button>
        ) : (
          <div></div>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] overflow-y-auto bg-white p-2 sm:max-w-none md:w-[70dvw] md:p-6">
        <DialogHeader>
          <DialogTitle className="text-cooper-gray-900 flex flex-col items-center justify-between text-2xl font-semibold md:flex-row md:gap-12"></DialogTitle>
        </DialogHeader>
        <div className="mx-2 mb-5 mt-2 flex items-start justify-between">
          <div className="flex">
            <div className="mr-3 flex h-12 w-12 items-center justify-center">
              <Logo company={company} />
            </div>
            <div>
              <h1 className="text-lg font-medium">{company.name}</h1>
              <p className="text-sm text-gray-600">
                {locations && locations.length > 1
                  ? `${locations[0]} +${locations.length - 1} ${locations.length - 1 === 1 ? "other" : "others"}`
                  : locations && locations.length === 1
                    ? locations[0]
                    : null}
              </p>
            </div>
          </div>
          <FavoriteButton objId={company.id} objType="company" />
        </div>
        <div className="flex flex-col md:flex-row">
          <div className="mx-4 gap-4 font-sans md:mx-auto md:w-[70%] md:max-w-[66dvw] md:pr-4">
            <div className="mb-6 gap-2 px-1 md:gap-4">
              <CompanyReview companyObj={company} />
            </div>

            <div className="my-8 border-t border-cooper-gray-200"></div>

            <CompanyAbout companyObj={company} />
          </div>
          <div>
            <RenderAllRoles company={company} onClose={() => setOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
