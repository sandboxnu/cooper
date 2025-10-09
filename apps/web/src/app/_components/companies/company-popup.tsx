"use client";

import { useState } from "react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";

import { api } from "~/trpc/react";
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

/**
 * General "+ New Review"
 *
 * @returns A "+ New Review" button that prompts users for a company + role before redirecting to the review form.
 */
export function CompanyPopup({ trigger, company }: CompanyPopupProps) {
  const session = api.auth.getSession.useQuery();

  if (!session.isSuccess && !session.data) {
    return;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ? (
          <Button className="m-0 -mt-2 border-none bg-white p-0 text-3xl font-thin text-black outline-none hover:bg-white">
            {trigger}
          </Button>
        ) : (
          <Button className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-3 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-300 hover:bg-cooper-yellow-300">
            <span className="translate-y-[-2px] text-2xl md:hidden">+</span>
            <span className="hidden md:inline">+ New Review</span>
          </Button>
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
                {company && <Logo company={company} size="small" />}
              </div>
              <div>
                <h1 className="text-4xl font-bold">{company.name}</h1>
                <p className="text-lg text-gray-600">
                  Co-op · {prettyIndustry(company.industry)}
                </p>
              </div>
            </div>
            {company && <FavoriteButton objId={company.id} objType="company" />}
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
