"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";

import { industryOptions, jobTypeOptions } from "../onboarding/constants";
import DropdownFilter from "./dropdown-filter";
import { abbreviatedStateName } from "~/utils/locationHelpers";
import { LocationType } from "@cooper/db/schema";

interface FilterState {
  industries: string[];
  locations: string[];
  jobTypes: string[];
  hourlyPay: { min: number; max: number };
  ratings: string[];
}

interface DropdownFiltersBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  jobTypes?: { id: string; label: string }[];
}

export default function DropdownFiltersBar({
  filters,
  onFilterChange,
  jobTypes = [],
}: DropdownFiltersBarProps) {
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
  const industryOptionsWithId = Object.entries(industryOptions).map(
    ([_value, label]) => ({
      id: label.value,
      label: label.label,
      value: label.value,
    }),
  );

  const locationOptions = useMemo(() => {
    const fromSelected = selectedLocations.map((loc) => ({
      id: loc.id,
      label: `${loc.city}${loc.state ? `, ${abbreviatedStateName(loc.state)}` : ""}`,
    }));

    const fromPrefix =
      locationsToUpdate.data?.map((loc) => ({
        id: loc.id,
        label: `${loc.city}${loc.state ? `, ${abbreviatedStateName(loc.state)}` : ""}`,
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

  return (
    <div className="flex gap-2">
      <DropdownFilter
        title="Industry"
        filterType="autocomplete"
        options={industryOptionsWithId}
        selectedOptions={filters.industries}
        onSelectionChange={(selected) =>
          handleFilterChange("industries", selected)
        }
      />

      <DropdownFilter
        title="Location"
        filterType="location"
        options={locationOptions}
        selectedOptions={filters.locations}
        onSelectionChange={(selected) =>
          handleFilterChange("locations", selected)
        }
        onSearchChange={(search) => setSearchTerm(search)}
      />

      <DropdownFilter
        title="Job type"
        filterType="checkbox"
        options={jobTypeOptionsWithId}
        selectedOptions={filters.jobTypes}
        onSelectionChange={(selected) =>
          handleFilterChange("jobTypes", selected)
        }
      />

      <DropdownFilter
        title="Hourly pay"
        options={[]}
        selectedOptions={[]}
        filterType="range"
        onRangeChange={(min, max) =>
          handleFilterChange("hourlyPay", { min, max })
        }
        placeholder="Select range"
      />

      <DropdownFilter
        title="Overall rating"
        options={[]}
        selectedOptions={filters.ratings}
        onSelectionChange={(selected) =>
          handleFilterChange("ratings", selected)
        }
        filterType="rating"
        placeholder="Select rating"
      />
    </div>
  );
}
