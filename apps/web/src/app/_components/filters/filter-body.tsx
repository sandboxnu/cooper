"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { cn } from "@cooper/ui";
import { Checkbox } from "@cooper/ui/checkbox";
import Autocomplete from "@cooper/ui/autocomplete";
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
  minValue?: number;
  maxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
  onSearchChange?: (search: string) => void;
  isLoadingOptions?: boolean;
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
  const [localMin, setLocalMin] = useState(minValue?.toString() ?? "");
  const [localMax, setLocalMax] = useState(maxValue?.toString() ?? "");
  const [rangeError, setRangeError] = useState<string | null>(null);

  // keep local inputs synced if parent passes new min/max
  useEffect(() => {
    setLocalMin(minValue?.toString() ?? "");
  }, [minValue]);

  useEffect(() => {
    setLocalMax(maxValue?.toString() ?? "");
  }, [maxValue]);

  const handleRangeApply = () => {
    if (!onRangeChange) return;

    const min = localMin ? parseFloat(localMin) : NaN;
    const max = localMax ? parseFloat(localMax) : NaN;

    if (!isNaN(min) && !isNaN(max) && min >= max) {
      setRangeError("Minimum must be less than maximum");
      return;
    }

    const appliedMin = !isNaN(min) ? min : 0;
    const appliedMax = !isNaN(max) ? max : 100;

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
    <div className="flex flex-col">
      <div className="flex gap-[10px] items-center">
        <div className="flex-1">
          <label className="text-xs text-cooper-gray-400 mb-1">Min</label>
        </div>
        <div className="w-4" />
        <div className="flex-1">
          <label htmlFor="max" className="text-xs text-cooper-gray-400 mb-1">
            Max
          </label>
        </div>
      </div>

      <div className="flex gap-[10px] items-center">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cooper-gray-400">
            $
          </span>
          <Input
            id="min"
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className={cn(
              "h-9 border-cooper-gray-150 border-[1px] text-sm text-cooper-gray-400 pl-5",
              rangeError ? "border-red-500" : "",
            )}
            onBlur={handleRangeApply}
            onKeyDown={(e) => e.key === "Enter" && handleRangeApply()}
          />
        </div>

        <hr className="border-cooper-gray-600 w-4" />

        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cooper-gray-400">
            $
          </span>
          <Input
            id="max"
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className={cn(
              "h-9 border-cooper-gray-150 border-[1px] text-sm text-cooper-gray-400 pl-5",
              rangeError ? "border-red-500" : "",
            )}
            onBlur={handleRangeApply}
            onKeyDown={(e) => e.key === "Enter" && handleRangeApply()}
          />
        </div>
      </div>

      {rangeError && <p className="text-xs text-red-600 mt-2">{rangeError}</p>}
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
    <div className="flex border border-cooper-gray-150 rounded-lg overflow-hidden">
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
              "flex-1 py-[10px] px-5 flex items-center justify-center gap-1 transition-colors relative bg-cooper-gray-150",
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
}: FilterBodyProps) {
  return (
    <Autocomplete
      options={options.map((option) => ({
        value: option.value ?? option.id,
        label: option.label,
      }))}
      value={selectedOptions}
      onChange={(selected) => onSelectionChange?.(selected)}
      placeholder={`Search by ${title === "Industry" ? "industry" : "city or state"}`}
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

      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
        {filteredOptions.map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Checkbox
              id={option.id}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={() => handleToggleOption(option.id)}
            />
            <label
              htmlFor={option.id}
              className="text-sm cursor-pointer flex-1"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
