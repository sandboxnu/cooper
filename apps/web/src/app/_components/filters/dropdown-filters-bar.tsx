"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";

import { Popover, PopoverAnchor, PopoverContent } from "@cooper/ui/popover";
import { industryOptions, jobTypeOptions } from "../onboarding/constants";
import DropdownFilter, { FilterPanelContent } from "./dropdown-filter";
import type { LocationType } from "@cooper/db/schema";
import type { FilterState } from "./types";
import { prettyLocationName } from "~/utils/locationHelpers";

type FilterKey = "industry" | "location" | "jobType" | "hourlyPay" | "rating";

interface DropdownFiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function DropdownFiltersBar({
  filters,
  onFilterChange,
}: DropdownFiltersBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);

  useEffect(() => {
    const newPrefix =
      searchTerm.length === 3 ? searchTerm.slice(0, 3).toLowerCase() : null;
    if (newPrefix && newPrefix !== prefix) {
      setPrefix(newPrefix);
    }
  }, [prefix, searchTerm]);

  const locationsToUpdate = api.location.getByPopularity.useQuery(
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

  // fetch each selected location so we can show labels immediately
  //this small part is like completely vibecoded btw :skull:
  const selectedLocationQueries = api.useQueries((t) =>
    filters.locations.map((id) =>
      t.location.getById(
        { id },
        {
          enabled: !!id,
        },
      ),
    ),
  );

  const selectedLocations = selectedLocationQueries
    .map((q) => q.data)
    .filter((loc): loc is LocationType => Boolean(loc));

  // Industry options from your schema
  const industryOptionsWithId = Object.entries(industryOptions)
    .map(([_value, label]) => ({
      id: label.value,
      label: label.label,
      value: label.value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const locationOptions = useMemo(() => {
    const fromSelected = selectedLocations.map((loc) => ({
      id: loc.id,
      label: prettyLocationName(loc),
    }));

    const fromPrefix =
      locationsToUpdate.data?.map((loc) => ({
        id: loc.id,
        label: prettyLocationName(loc),
      })) ?? [];

    // merge + dedupe by id
    const map = new Map<string, { id: string; label: string }>();
    for (const opt of [...fromSelected, ...fromPrefix]) map.set(opt.id, opt);

    return Array.from(map.values());
  }, [selectedLocations, locationsToUpdate.data]);

  // Job type options
  const jobTypeOptionsWithId = jobTypeOptions.map((jobType) => ({
    id: jobType.value,
    label: jobType.label,
    value: jobType.value,
  }));

  const setFilterOpen = (key: FilterKey) => {
    setOpenFilterKey((prev) => (prev === key ? null : key));
  };

  const wrapAnchor = (key: FilterKey, node: React.ReactNode) =>
    openFilterKey === key ? (
      <PopoverAnchor asChild key={key}>
        {node}
      </PopoverAnchor>
    ) : (
      node
    );

  return (
    <Popover
      open={openFilterKey !== null}
      onOpenChange={(open) => !open && setOpenFilterKey(null)}
    >
      <div className="flex gap-2">
        {wrapAnchor(
          "industry",
          <DropdownFilter
            key="industry"
            title="Industry"
            filterType="autocomplete"
            options={industryOptionsWithId}
            selectedOptions={filters.industries}
            onSelectionChange={(selected) =>
              handleFilterChange("industries", selected)
            }
            triggerOnly
            open={openFilterKey === "industry"}
            onTriggerClick={() => setFilterOpen("industry")}
          />,
        )}
        {wrapAnchor(
          "location",
          <DropdownFilter
            key="location"
            title="Location"
            filterType="location"
            options={locationOptions}
            selectedOptions={filters.locations}
            onSelectionChange={(selected) =>
              handleFilterChange("locations", selected)
            }
            onSearchChange={(search) => setSearchTerm(search)}
            triggerOnly
            open={openFilterKey === "location"}
            onTriggerClick={() => setFilterOpen("location")}
          />,
        )}
        {wrapAnchor(
          "jobType",
          <DropdownFilter
            key="jobType"
            title="Job type"
            filterType="checkbox"
            options={jobTypeOptionsWithId}
            selectedOptions={filters.jobTypes}
            onSelectionChange={(selected) =>
              handleFilterChange("jobTypes", selected)
            }
            triggerOnly
            open={openFilterKey === "jobType"}
            onTriggerClick={() => setFilterOpen("jobType")}
          />,
        )}
        {wrapAnchor(
          "hourlyPay",
          <DropdownFilter
            key="hourlyPay"
            title="Hourly pay"
            options={[]}
            selectedOptions={[]}
            filterType="range"
            onRangeChange={(min, max) =>
              handleFilterChange("hourlyPay", { min, max })
            }
            placeholder="Select range"
            minValue={filters.hourlyPay.min}
            maxValue={filters.hourlyPay.max}
            triggerOnly
            open={openFilterKey === "hourlyPay"}
            onTriggerClick={() => setFilterOpen("hourlyPay")}
          />,
        )}
        {wrapAnchor(
          "rating",
          <DropdownFilter
            key="rating"
            title="Overall rating"
            options={[]}
            selectedOptions={filters.ratings}
            onSelectionChange={(selected) =>
              handleFilterChange("ratings", selected)
            }
            filterType="rating"
            placeholder="Select rating"
            triggerOnly
            open={openFilterKey === "rating"}
            onTriggerClick={() => setFilterOpen("rating")}
          />,
        )}
      </div>
      <PopoverContent align="start" className="p-0 bg-transparent border-0">
        {openFilterKey === "industry" && (
          <FilterPanelContent
            title="Industry"
            filterType="autocomplete"
            options={industryOptionsWithId}
            selectedOptions={filters.industries}
            onSelectionChange={(selected) =>
              handleFilterChange("industries", selected)
            }
            onClose={() => setOpenFilterKey(null)}
          />
        )}
        {openFilterKey === "location" && (
          <FilterPanelContent
            title="Location"
            filterType="location"
            options={locationOptions}
            selectedOptions={filters.locations}
            onSelectionChange={(selected) =>
              handleFilterChange("locations", selected)
            }
            onSearchChange={(search) => setSearchTerm(search)}
            onClose={() => setOpenFilterKey(null)}
          />
        )}
        {openFilterKey === "jobType" && (
          <FilterPanelContent
            title="Job type"
            filterType="checkbox"
            options={jobTypeOptionsWithId}
            selectedOptions={filters.jobTypes}
            onSelectionChange={(selected) =>
              handleFilterChange("jobTypes", selected)
            }
            onClose={() => setOpenFilterKey(null)}
          />
        )}
        {openFilterKey === "hourlyPay" && (
          <FilterPanelContent
            title="Hourly pay"
            filterType="range"
            options={[]}
            selectedOptions={[]}
            onRangeChange={(min, max) =>
              handleFilterChange("hourlyPay", { min, max })
            }
            minValue={filters.hourlyPay.min}
            maxValue={filters.hourlyPay.max}
            placeholder="Select range"
            onClose={() => setOpenFilterKey(null)}
          />
        )}
        {openFilterKey === "rating" && (
          <FilterPanelContent
            title="Overall rating"
            filterType="rating"
            options={[]}
            selectedOptions={filters.ratings}
            onSelectionChange={(selected) =>
              handleFilterChange("ratings", selected)
            }
            placeholder="Select rating"
            onClose={() => setOpenFilterKey(null)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
