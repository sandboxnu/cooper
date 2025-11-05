"use client";

import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";

import { CompanyType } from "@cooper/db/schema";
import Logo from "node_modules/@cooper/ui/src/logo";
import { FavoriteButton } from "../shared/favorite-button";
import { CompanyAbout } from "./company-about";
import { CompanyReview } from "./company-reviews";
import RenderAllRoles from "./all-company-roles";

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
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? (
          <Button className="m-0 -mt-2 border-none bg-cooper-cream-100 p-0  text-cooper-gray-400 text-md hover:underline outline-none hover:bg-cooper-cream-100">
            {trigger}
          </Button>
        ) : (
          <div></div>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] w-[70dvw] sm:max-w-none overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-cooper-gray-900 flex flex-col items-center justify-between text-2xl font-semibold md:flex-row md:gap-12"></DialogTitle>
        </DialogHeader>
        <div className="mx-2 mb-5 mt-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-16 w-16 items-center justify-center">
              <Logo company={company} size="small" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold">{company.name}</h1>
              <p className="text-lg text-gray-600">
                {locations && locations.length > 1
                  ? `${locations[0]} + ${locations.length - 1} ${locations.length - 1 === 1 ? "other" : "others"}`
                  : locations && locations.length === 1
                    ? locations[0]
                    : null}
              </p>
            </div>
          </div>
          <FavoriteButton objId={company.id} objType="company" />
        </div>
        <div className="flex flex-row">
          <div className="mx-4 h-[86dvh] w-[70%] gap-4 font-sans md:mx-auto md:max-w-[66dvw] pr-4">
            <div className="mb-6 gap-2 px-1 md:gap-4">
              <CompanyReview companyObj={company} />
            </div>

            <div className="my-8 border-t border-cooper-gray-200"></div>

            <CompanyAbout companyObj={company} />
          </div>
          <div>
            <RenderAllRoles company={company} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
