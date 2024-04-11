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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

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
    {
      value: string;
      label: string;
    }[]
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
        <Button className="bg-cooper-yellow-500">+ New Review</Button>
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
            <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
              <PopoverTrigger asChild className="min-w-[400px]">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companyOpen}
                  className="w-[180px] justify-between"
                >
                  {companyLabel || "Select company..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search company..." />
                  <CommandEmpty>No company found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {companyValuesAndLabels.map((company) => (
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
                            console.log(roles);
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
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {/* ROLES COMBOBOX */}
            <Popover open={roleOpen} onOpenChange={setRoleOpen}>
              <PopoverTrigger asChild className="min-w-[400px]">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={roleOpen}
                  className="w-[180px] justify-between"
                >
                  {roleLabel || "Select role..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search role..." />
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {roleValuesAndLabels.map((role) => (
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
                              roleLabel === role.label
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {role.label}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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
