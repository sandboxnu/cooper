"use-client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import DropdownFilter from "./dropdown-filter";
import { industryOptions } from "../onboarding/constants";
import { jobTypeOptions } from "../onboarding/constants";
import { abbreviatedStateName } from "~/utils/locationHelpers";
import { Button } from "@cooper/ui/button";
import { Chip } from "@cooper/ui/chip";
import Autocomplete from "@cooper/ui/autocomplete";
import RoleTypeSelector from "./role-type-selector";

interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
}

interface SidebarFilterProps {
  isOpen: boolean;
  onClose: () => void;

  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;

  selectedType: "roles" | "companies" | "all";
  onSelectedTypeChange: (t: "roles" | "companies" | "all") => void;

  data?: {
    totalRolesCount: number;
    totalCompanyCount: number;
  };
}

export default function SidebarFilter({
  filters,
  isOpen,
  onFilterChange,
  onClose,
  selectedType,
  onSelectedTypeChange,
  data,
}: SidebarFilterProps) {
  if (!isOpen) {
    return null;
  }

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");

  useEffect(() => {
    const newPrefix =
      searchTerm.length === 3 ? searchTerm.slice(0, 3).toLowerCase() : null;
    if (newPrefix && newPrefix !== prefix) {
      setPrefix(newPrefix);
    }
  }, [prefix, searchTerm]);

  const locationsToUpdate = api.location.getByPrefix.useQuery(
    { prefix },
    { enabled: searchTerm.length === 3 && prefix.length === 3 },
  );

  const handleFilterChange = (
    key: keyof FilterState,
    value: string[] | { min: number; max: number },
  ) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    onFilterChange(newFilters);
  };

  // Industry options from your schema
  const industryOptionsWithId = Object.entries(industryOptions).map(
    ([_value, label]) => ({
      id: label.value,
      label: label.label,
      value: label.value,
    }),
  );

  // Location options
  const locationOptions = locationsToUpdate.data
    ? locationsToUpdate.data.map((loc) => ({
        id: loc.id,
        label: `${loc.city}${loc.state ? `, ${abbreviatedStateName(loc.state)}` : ""}`,
      }))
    : [];

  // Job type options
  const jobTypeOptionsWithId = jobTypeOptions.map((jobType) => ({
    id: jobType.value,
    label: jobType.label,
    value: jobType.value,
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <div className="fixed right-0 top-0 h-screen w-1/3 bg-cooper-cream-100 shadow-xl">
        <div className="flex flex-col mx-4 gap-y-2 my-4">
          <div className="flex items-center justify-start gap-4 border-cooper-gray-300 px-4">
            <Button
              variant="ghost"
              className="text-cooper-gray-300 p-0"
              onClick={onClose}
            >
              X
            </Button>

            <p>Filters</p>
          </div>
          <div className="h-px w-full bg-cooper-gray-150" />
          <RoleTypeSelector
            onSelectedTypeChange={onSelectedTypeChange}
            selectedType={selectedType}
            data={{
              totalRolesCount: data?.totalRolesCount || 0,
              totalCompanyCount: data?.totalCompanyCount || 0,
            }}
          />
          <div className="h-px w-full bg-cooper-gray-150" />

          <DropdownFilter
            title="Industry"
            filterType="autocomplete"
            options={industryOptionsWithId}
            selectedOptions={filters.industries}
            onSelectionChange={(selected) =>
              handleFilterChange("industries", selected)
            }
            isSideBar
          />
        </div>
      </div>
    </div>
  );
}
