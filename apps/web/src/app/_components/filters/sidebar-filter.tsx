"use-client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { industryOptions } from "../onboarding/constants";
import { jobTypeOptions, workModelOptions } from "../onboarding/constants";
import { abbreviatedStateName } from "~/utils/locationHelpers";
import { Button } from "@cooper/ui/button";
import RoleTypeSelector from "./role-type-selector";
import SidebarSection from "./sidebar-section";
import { ChevronRight } from "lucide-react";
import { cn } from "@cooper/ui";

interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
  workModels?: string[];
  overtimeWork?: string[];
  companyCulture?: string[];
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
  isLoading?: boolean;
}

export default function SidebarFilter({
  filters,
  isOpen,
  onFilterChange,
  onClose,
  selectedType,
  onSelectedTypeChange,
  data,
  isLoading,
}: SidebarFilterProps) {
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

  const workModelOptionsWithId = workModelOptions.map((workModel) => ({
    // placeholder since not gonna implement backend yet
    id: workModel.value,
    label: workModel.label,
    value: workModel.value,
  }));

  const clearAll = () => {
    onFilterChange({
      industries: [],
      locations: [],
      jobTypes: [],
      hourlyPay: { min: 0, max: 0 },
      ratings: [],
      workModels: [],
      overtimeWork: [],
      companyCulture: [],
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200",
        isOpen
          ? "opacity-100 bg-black/30 pointer-events-auto"
          : "opacity-0 bg-black/0 pointer-events-none",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "fixed right-0 top-0 h-screen w-1/3 bg-cooper-cream-100 shadow-xl",
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          "overflow-y-auto",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col mx-6 mt-3">
          <div className="flex items-center justify-start gap-2 mb-2 ml-[-12px]">
            <Button
              className="text-cooper-gray-300 p-0 bg-transparent border-0 hover:bg-transparent"
              onClick={onClose}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <p className="text-lg font-semibold">Filters</p>
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
          <SidebarSection
            title="Industry"
            filterType="autocomplete"
            options={industryOptionsWithId}
            selectedOptions={filters.industries}
            onSelectionChange={(selected) =>
              handleFilterChange("industries", selected)
            }
          />
          <div className="h-px w-full bg-cooper-gray-150" />
          <SidebarSection
            title="Location"
            filterType="location"
            options={locationOptions}
            selectedOptions={filters.locations}
            onSelectionChange={(selected) =>
              handleFilterChange("locations", selected)
            }
            onSearchChange={(search) => setSearchTerm(search)}
          />
          <div className="h-px w-full bg-cooper-gray-150" />
          <SidebarSection
            title="Job type"
            filterType="checkbox"
            options={jobTypeOptionsWithId}
            selectedOptions={filters.jobTypes}
            onSelectionChange={(selected) =>
              handleFilterChange("jobTypes", selected)
            }
          />
          <div className="h-px w-full bg-cooper-gray-150" />
          <div className="flex flex-col py-2">
            {/* all of these don't work in the backend btw/dont rly have functionality atm.  */}
            <span className="font-semibold text-base">On the job</span>
            <SidebarSection
              title="Work model"
              filterType="checkbox"
              options={workModelOptionsWithId}
              selectedOptions={filters.workModels || []}
              variant="subsection"
              onSelectionChange={(selected) =>
                handleFilterChange("workModels", selected)
              }
            />
            <SidebarSection
              title="Overtime work"
              filterType="checkbox"
              options={[
                {
                  id: "Yes",
                  label: "Overtime work commonly expected",
                  value: "Yes",
                },
              ]}
              selectedOptions={filters.overtimeWork ? filters.overtimeWork : []}
              onSelectionChange={(selected) =>
                handleFilterChange("overtimeWork", selected)
              }
              variant="subsection"
            />
            <SidebarSection
              title="Company Culture"
              filterType="rating"
              options={[]}
              selectedOptions={filters.companyCulture || []}
              variant="subsection"
              onSelectionChange={(selected) =>
                handleFilterChange("companyCulture", selected)
              }
            />
            <div className="h-px w-full bg-cooper-gray-150" />
            <div className="flex justify-between items-center m-2">
              <Button
                className="bg-transparent border-none text-cooper-gray-400 text-sm hover:bg-transparent p-0"
                onClick={clearAll}
              >
                Clear all
              </Button>
              <Button
                className="bg-cooper-gray-300 text-cooper-gray-100 font-semibold text-sm hover:bg-cooper-gray-400 px-2 py-1 border-0"
                onClick={onClose}
              >
                {!isLoading
                  ? "Show Results " +
                    `(${(data?.totalRolesCount || 0) + (data?.totalCompanyCount || 0)})`
                  : "Loading..."}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
