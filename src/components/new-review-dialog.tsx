"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { CommandItem } from "./ui/command";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import ComboBox, { ComboBoxOption } from "./combo-box";

// God forgive me for whatever this component turned out to be

export function NewReviewDialog() {
  const router = useRouter();
  // State for the company combo box
  const [companyOpen, setCompanyOpen] = useState<boolean>(false);
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
  const [roleOpen, setRoleOpen] = useState<boolean>(false);
  const [roleLabel, setRoleLabel] = useState<string>("");

  const roles = api.role.list.useQuery();
  const [roleValuesAndLabels, setRoleValuesAndLabels] = useState<
    ComboBoxOption<string>[]
  >([]);

  function updateAvailableRoles(newCompanyLabel: string) {
    const companyId =
      companyValuesAndLabels.find(
        (company) => company.label === newCompanyLabel,
      )?.value || "";
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
        <Button className="h-9 border-none bg-cooper-yellow-500 px-4 py-3 text-sm font-normal">
          + New Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Review</DialogTitle>
          <DialogDescription>
            Pick which company and role to create a review for, click next when
            done.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const roleId =
              roleValuesAndLabels.find((role) => role.label === roleLabel)
                ?.value || "";
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
              optionToNode={(company: ComboBoxOption<string>) => (
                <CommandItem
                  key={company.value}
                  value={company.label}
                  onSelect={(currentValue) => {
                    setCompanyLabel(
                      currentValue === companyLabel ? "" : currentValue,
                    );
                    updateAvailableRoles(
                      currentValue === companyLabel ? "" : currentValue,
                    );
                    setRoleLabel("");
                    setCompanyOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      companyLabel === company.label
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {company.label}
                </CommandItem>
              )}
              isOpen={companyOpen}
              setIsOpen={setCompanyOpen}
            />
            {/* ROLES COMBOBOX */}
            <ComboBox
              defaultLabel={roleLabel || "Select role..."}
              searchPlaceholder="Search role..."
              searchEmpty="No role found."
              valuesAndLabels={roleValuesAndLabels}
              optionToNode={(role: ComboBoxOption<string>) => (
                <CommandItem
                  key={role.value}
                  value={role.label}
                  onSelect={(currentValue) => {
                    setRoleLabel(
                      currentValue === roleLabel ? "" : currentValue,
                    );
                    // Close the combobox
                    setRoleOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      roleLabel === role.label ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {role.label}
                </CommandItem>
              )}
              isOpen={roleOpen}
              setIsOpen={setRoleOpen}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-cooper-blue-400 hover:bg-cooper-blue-600"
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
