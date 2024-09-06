"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";

import type { ComboBoxOption } from "~/app/_components/combo-box";
import ComboBox from "~/app/_components/combo-box";
import { api } from "~/trpc/react";

/**
 * General "+ New Review"
 *
 * @returns A "+ New Review" button that prompts users for a company + role before redirecting to the review form.
 */
export function NewReviewDialog() {
  const router = useRouter();
  // State for the company combo box
  const [companyLabel, setCompanyLabel] = useState<string>("");

  const companies = api.company.list.useQuery();
  const companyValuesAndLabels = companies.data
    ? companies.data.map((company) => {
        return {
          value: company.id,
          label: company.name,
        };
      })
    : [];

  // State for the role combo box
  const [roleLabel, setRoleLabel] = useState<string>("");

  const roles = api.role.list.useQuery();
  const [roleValuesAndLabels, setRoleValuesAndLabels] = useState<
    ComboBoxOption<string>[]
  >([]);

  /**
   * Filters the available roles based on the currently selected company
   *
   * @param newCompanyLabel The company to filter the roles by
   */
  function updateAvailableRoles(newCompanyLabel: string) {
    const companyId =
      companyValuesAndLabels.find(
        (company) => company.label === newCompanyLabel,
      )?.value ?? "";
    const filteredRoleValuesAndLabels = roles.data
      ? roles.data
          .filter((role) => role.companyId === companyId)
          .map((role) => {
            return {
              value: role.id,
              label: role.title,
            };
          })
      : [];
    setRoleValuesAndLabels(filteredRoleValuesAndLabels);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-full border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-4 py-3 text-sm font-semibold text-white hover:border-cooper-yellow-300 hover:bg-cooper-yellow-300">
          + New Review
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Review</DialogTitle>
          <DialogDescription>
            Pick the company and role to create a review for. Click next when
            done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const roleId =
              roleValuesAndLabels.find((role) => role.label === roleLabel)
                ?.value ?? "";
            router.push("/review?id=" + roleId);
          }}
        >
          <div className="flex flex-col items-center gap-4 py-4">
            {/* COMPANY COMBOBOX */}
            <ComboBox
              defaultLabel={companyLabel || "Select company..."}
              searchPlaceholder="Search company..."
              searchEmpty="No company found."
              valuesAndLabels={companyValuesAndLabels}
              currLabel={companyLabel}
              onSelect={(currentValue) => {
                setCompanyLabel(
                  currentValue === companyLabel ? "" : currentValue,
                );
                updateAvailableRoles(
                  currentValue === companyLabel ? "" : currentValue,
                );
                setRoleLabel("");
              }}
            />
            {/* ROLES COMBOBOX */}
            <ComboBox
              defaultLabel={roleLabel || "Select role..."}
              searchPlaceholder="Search role..."
              searchEmpty="No role found."
              valuesAndLabels={roleValuesAndLabels}
              currLabel={roleLabel}
              onSelect={(currentValue) => {
                setRoleLabel(currentValue === roleLabel ? "" : currentValue);
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="border-none bg-cooper-blue-400 text-white hover:bg-cooper-blue-600"
              disabled={!roleLabel}
            >
              Next
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
