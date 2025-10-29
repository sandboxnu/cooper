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
import { prettyIndustry } from "~/utils/stringHelpers";
import { FavoriteButton } from "../shared/favorite-button";
import { CompanyAbout } from "./company-about";
import { CompanyReview } from "./company-reviews";
import RenderAllRoles from "./all-company-roles";

interface CompanyPopupProps {
  trigger?: React.ReactNode;
  company: CompanyType;
}

export function CompanyPopup({ trigger, company }: CompanyPopupProps) {
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
      <DialogContent className="max-h-[80dvh] w-[48dvw] sm:max-w-none overflow-y-scroll bg-white">
        <DialogHeader>
          <DialogTitle className="text-cooper-gray-900 flex flex-col items-center justify-between text-2xl font-semibold md:flex-row md:gap-12"></DialogTitle>
        </DialogHeader>
        <div className="mx-4 h-[86dvh] justify-center gap-4 font-sans md:mx-auto md:max-w-[66dvw]">
          <div className="mx-2 mb-6 mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-16 w-16 items-center justify-center">
                <Logo company={company} size="small" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">{company.name}</h1>
                <p className="text-lg text-gray-600">
                  Co-op · {prettyIndustry(company.industry)}
                </p>
              </div>
            </div>
            <FavoriteButton objId={company.id} objType="company" />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-2 px-1 md:grid-cols-[2fr_3fr] md:gap-4">
            <CompanyAbout companyObj={company} />
            <CompanyReview companyObj={company} />
          </div>

          <div className="my-8 border-t border-cooper-gray-400"></div>
          <RenderAllRoles company={company.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
