"use-client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import type { FilterState } from "./types";
import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import {
  industryOptions,
  jobTypeOptions,
  workModelOptions,
} from "../onboarding/constants";
import RoleTypeSelector from "./role-type-selector";
import SidebarSection from "./sidebar-section";

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

/**
 * Main Sidebar Filter component for filtering job listings.
 */
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
        label: prettyLocationName(loc),
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

  const handleClearOnTheJob = () => {
    onFilterChange({
      ...filters,
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
          ? "pointer-events-auto bg-black/30 opacity-100"
          : "pointer-events-none bg-black/0 opacity-0",
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-cooper-cream-100 fixed right-0 top-0 h-screen w-full shadow-xl md:w-1/3",
          "transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="no-scrollbar mx-6 mt-3 flex flex-col overflow-y-auto pb-20">
          <div className="ml-[-6px] flex items-center justify-start gap-2">
            <Button
              className="border-0 bg-transparent p-0 text-cooper-gray-300 hover:bg-transparent"
              onClick={onClose}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <p className="text-lg font-bold">Filters</p>
          </div>

          <div className="flex flex-col gap-[12px]">
            <div className="bg-cooper-gray-150 h-px w-full" />
            <RoleTypeSelector
              onSelectedTypeChange={onSelectedTypeChange}
              selectedType={selectedType}
              data={{
                totalRolesCount: data?.totalRolesCount ?? 0,
                totalCompanyCount: data?.totalCompanyCount ?? 0,
              }}
              isLoading={isLoading}
            />
            <div className="bg-cooper-gray-150 h-px w-full" />
            <SidebarSection
              title="Industry"
              filterType="autocomplete"
              options={industryOptionsWithId}
              selectedOptions={filters.industries}
              onSelectionChange={(selected) =>
                handleFilterChange("industries", selected)
              }
            />
            <div className="bg-cooper-gray-150 h-px w-full" />
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
            <div className="bg-cooper-gray-150 h-px w-full" />
            <SidebarSection
              title="Job type"
              filterType="checkbox"
              options={jobTypeOptionsWithId}
              selectedOptions={filters.jobTypes}
              onSelectionChange={(selected) =>
                handleFilterChange("jobTypes", selected)
              }
            />
            <div className="bg-cooper-gray-150 h-px w-full" />

            <SidebarSection
              title="Hourly pay"
              filterType="range"
              options={[]}
              selectedOptions={[]}
              minValue={filters.hourlyPay.min}
              maxValue={filters.hourlyPay.max}
              onRangeChange={(min, max) =>
                handleFilterChange("hourlyPay", { min, max })
              }
            />

            <div className="bg-cooper-gray-150 h-px w-full" />

            {/* On the job subsection */}
            <div className="flex flex-col gap-[10px]">
              <div className="flex gap-2">
                <span className="text-base font-normal">On the job</span>
                <Button
                  className="h-auto self-center border-none bg-transparent p-0 text-xs font-normal text-cooper-gray-400 hover:bg-transparent"
                  onClick={handleClearOnTheJob}
                >
                  Clear
                </Button>
              </div>
              <SidebarSection
                title="Work model"
                filterType="checkbox"
                options={workModelOptionsWithId}
                selectedOptions={filters.workModels}
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
                    label: "Overtime commonly expected",
                    value: "Yes",
                  },
                ]}
                selectedOptions={filters.overtimeWork}
                onSelectionChange={(selected) =>
                  handleFilterChange("overtimeWork", selected)
                }
                variant="subsection"
              />
              <SidebarSection
                title="Company Culture"
                filterType="rating"
                options={[]}
                selectedOptions={filters.companyCulture}
                variant="subsection"
                onSelectionChange={(selected) =>
                  handleFilterChange("companyCulture", selected)
                }
              />
            </div>

            <div className="bg-cooper-gray-150 h-px w-full" />

            <SidebarSection
              title="Overall rating"
              filterType="rating"
              options={[]}
              selectedOptions={filters.ratings}
              onSelectionChange={(selected) =>
                handleFilterChange("ratings", selected)
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-cooper-cream-100 absolute bottom-0 left-0 right-0 flex flex-col items-center px-6 pb-4">
          <div className="bg-cooper-gray-150 h-px w-full" />
          <div className="mt-2 flex w-full items-center justify-between">
            <Button
              className="text-cooper-gray-550 border-none bg-transparent p-0 text-sm hover:bg-transparent"
              onClick={clearAll}
            >
              Clear all
            </Button>
            <Button
              className="bg-cooper-gray-550 border-0 px-2 py-1 text-sm font-semibold text-cooper-gray-100 hover:bg-cooper-gray-400"
              onClick={onClose}
            >
              {!isLoading
                ? "Show Results " +
                  `(${(data?.totalRolesCount ?? 0) + (data?.totalCompanyCount ?? 0)})`
                : "Loading..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
