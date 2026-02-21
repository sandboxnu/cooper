"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { cn } from "@cooper/ui";
import Autocomplete from "@cooper/ui/autocomplete";
import { Checkbox } from "@cooper/ui/checkbox";

import { Input } from "../themed/onboarding/input";

export interface FilterOption {
  id: string;
  label: string;
  value?: string;
}

export type FilterVariant =
  | "autocomplete"
  | "checkbox"
  | "range"
  | "rating"
  | "location";

interface FilterBodyProps {
  variant: FilterVariant;
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  onSelectionChange?: (selected: string[]) => void;
  placeholder?: string;
  /** When true (autocomplete only), only one option can be selected; value shows in bar and dropdown closes on select. */
  singleSelect?: boolean;
  minValue?: number;
  maxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
  onSearchChange?: (search: string) => void;
  isLoadingOptions?: boolean;
  isInMenuContent?: boolean;
}

/**
 * Switch/router component that returns the correct filter-body subcomponent.
 * This is extracted from DropdownFilter's previous renderContent().
 */
export default function FilterBody(props: FilterBodyProps) {
  const { variant } = props;

  switch (variant) {
    case "range":
      return <FilterBodyRange {...props} />;

    case "rating":
      return <FilterBodyRating {...props} />;

    case "autocomplete":
      return <FilterBodyAutocomplete {...props} />;

    case "location":
      return <FilterBodyLocation {...props} />;

    case "checkbox":
    default:
      return <FilterBodyCheckbox {...props} />;
  }
}

function FilterBodyRange({
  minValue,
  maxValue,
  onRangeChange,
}: FilterBodyProps) {
  // Show empty inputs when the parent range is the default (0,0)
  const [localMin, setLocalMin] = useState(
    minValue === 0 && maxValue === 0 ? "" : (minValue?.toString() ?? ""),
  );
  const [localMax, setLocalMax] = useState(
    minValue === 0 && maxValue === 0 ? "" : (maxValue?.toString() ?? ""),
  );
  const [rangeError, setRangeError] = useState<string | null>(null);

  // keep local inputs synced if parent passes new min/max
  useEffect(() => {
    // Treat (0,0) as "no selection" and show empty inputs
    if (minValue === 0 && maxValue === 0) {
      setLocalMin("");
      return;
    }

    setLocalMin(minValue?.toString() ?? "");
  }, [minValue, maxValue]);

  useEffect(() => {
    // Treat (0,0) as "no selection" and show empty inputs
    if (minValue === 0 && maxValue === 0) {
      setLocalMax("");
      return;
    }

    setLocalMax(maxValue?.toString() ?? "");
  }, [minValue, maxValue]);

  const handleRangeApply = () => {
    if (!onRangeChange) return;

    const min = localMin ? parseFloat(localMin) : NaN;
    const max = localMax ? parseFloat(localMax) : NaN;

    if (!isNaN(min) && !isNaN(max) && min >= max) {
      setRangeError("Minimum must be less than maximum");
      return;
    }

    // If both inputs are empty, treat this as clearing the range (0,0)
    if (isNaN(min) && isNaN(max)) {
      setRangeError(null);
      onRangeChange(0, 0);
      return;
    }

    const appliedMin = !isNaN(min) ? min : 0;
    const appliedMax = !isNaN(max) ? max : Infinity;

    setRangeError(null);
    onRangeChange(appliedMin, appliedMax);
  };

  useEffect(() => {
    const min = localMin ? parseFloat(localMin) : NaN;
    const max = localMax ? parseFloat(localMax) : NaN;

    if (!isNaN(min) && !isNaN(max)) {
      setRangeError(min >= max ? "Minimum must be less than maximum" : null);
    } else {
      setRangeError(null);
    }
  }, [localMin, localMax]);

  return (
    <div className="-mt-2 flex flex-col">
      <div className="flex items-center gap-[10px]">
        <div className="flex-1">
          <label className="mb-1 text-xs text-cooper-gray-400">Min</label>
        </div>
        <div className="w-4" />
        <div className="flex-1">
          <label htmlFor="max" className="mb-1 text-xs text-cooper-gray-400">
            Max
          </label>
        </div>
      </div>

      <div className="flex items-center gap-[10px]">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cooper-gray-400">
            $
          </span>
          <Input
            id="min"
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className={cn(
              "border-cooper-gray-150 h-9 border-[1px] pl-5 text-sm text-cooper-gray-400",
              rangeError ? "border-red-500" : "",
            )}
            onBlur={handleRangeApply}
            onKeyDown={(e) => e.key === "Enter" && handleRangeApply()}
          />
        </div>

        <hr className="border-cooper-gray-600 w-4" />

        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cooper-gray-400">
            $
          </span>
          <Input
            id="max"
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className={cn(
              "border-cooper-gray-150 h-9 border-[1px] pl-5 text-sm text-cooper-gray-400",
              rangeError ? "border-red-500" : "",
            )}
            onBlur={handleRangeApply}
            onKeyDown={(e) => e.key === "Enter" && handleRangeApply()}
          />
        </div>
      </div>

      {rangeError && <p className="mt-2 text-xs text-red-600">{rangeError}</p>}
    </div>
  );
}

function FilterBodyRating({
  selectedOptions,
  onSelectionChange,
}: FilterBodyProps) {
  const minRating =
    selectedOptions.length > 0 ? Math.min(...selectedOptions.map(Number)) : 0;
  const maxRating =
    selectedOptions.length > 0 ? Math.max(...selectedOptions.map(Number)) : 0;

  const handleRatingClick = (rating: number) => {
    if (!onSelectionChange) return;

    if (selectedOptions.length === 0) {
      onSelectionChange([rating.toString()]);
      return;
    }

    if (selectedOptions.length === 1) {
      const current = Number(selectedOptions[0]);
      if (rating === current) {
        onSelectionChange([]);
        return;
      }

      const min = Math.min(current, rating);
      const max = Math.max(current, rating);
      const range: string[] = [];
      for (let i = min; i <= max; i++) range.push(i.toString());
      onSelectionChange(range);
      return;
    }

    onSelectionChange([rating.toString()]);
  };

  return (
    <div className="border-cooper-gray-150 flex overflow-hidden rounded-lg border">
      {[1, 2, 3, 4, 5].map((rating, index) => {
        const isInRange =
          rating >= minRating &&
          rating <= maxRating &&
          selectedOptions.length > 0;

        return (
          <button
            key={rating}
            onClick={() => handleRatingClick(rating)}
            className={cn(
              "bg-cooper-gray-150 relative flex flex-1 items-center justify-center gap-1 px-5 py-[10px] transition-colors",
              isInRange
                ? "hover:bg-cooper-yellow-200 bg-cooper-yellow-400"
                : "hover:bg-cooper-yellow-200",
              index !== 4 && "border-r border-white",
            )}
          >
            <Image src="/svg/star.svg" alt="Star icon" width={20} height={20} />
            <span className="text-sm">{rating}.0</span>
          </button>
        );
      })}
    </div>
  );
}

function FilterBodyAutocomplete({
  title,
  options,
  selectedOptions,
  onSelectionChange,
  placeholder,
  singleSelect,
  onSearchChange,
  isInMenuContent,
}: FilterBodyProps) {
  return (
    <Autocomplete
      options={options.map((option) => ({
        value: option.value ?? option.id,
        label: option.label,
      }))}
      value={selectedOptions}
      onChange={(selected) => onSelectionChange?.(selected)}
      placeholder={
        placeholder ??
        `Search by ${title === "Industry" ? "industry" : "city or state"}`
      }
      singleSelect={singleSelect}
      onSearchChange={onSearchChange}
      isInMenuContent={isInMenuContent}
    />
  );
}

function FilterBodyLocation({
  options,
  selectedOptions,
  onSelectionChange,
  onSearchChange,
}: FilterBodyProps) {
  return (
    <div className="flex flex-col gap-3">
      <Autocomplete
        options={options.map((option) => ({
          value: option.id,
          label: option.label,
        }))}
        value={selectedOptions}
        onChange={(selected) => onSelectionChange?.(selected)}
        placeholder="Search by city or state..."
        onSearchChange={onSearchChange}
      />
    </div>
  );
}

function FilterBodyCheckbox({
  options,
  selectedOptions,
  onSelectionChange,
}: FilterBodyProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchTerm]);

  const handleToggleOption = (optionId: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedOptions.includes(optionId)
        ? selectedOptions.filter((id) => id !== optionId)
        : [...selectedOptions, optionId],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {options.length > 5 && (
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      )}

      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {filteredOptions.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Checkbox
              id={option.id}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={() => handleToggleOption(option.id)}
            />
            <label
              htmlFor={option.id}
              className="flex-1 cursor-pointer text-sm"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
