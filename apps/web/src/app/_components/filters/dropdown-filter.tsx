"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@cooper/ui";

import Image from "next/image";

import { Input } from "../themed/onboarding/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";
import { Button } from "@cooper/ui/button";
import { Checkbox } from "@cooper/ui/checkbox";
import Autocomplete from "@cooper/ui/autocomplete";

interface FilterOption {
  id: string;
  label: string;
  value?: string;
}

interface DropdownFilterProps {
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  onSelectionChange?: (selected: string[]) => void;
  placeholder?: string;
  filterType?: "autocomplete" | "checkbox" | "range" | "rating" | "location";
  minValue?: number;
  maxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
}

interface DropdownFilterProps {
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  onSelectionChange?: (selected: string[]) => void;
  placeholder?: string;
  onSearchChange?: (search: string) => void;
  isLoadingOptions?: boolean;
}

export default function DropdownFilter({
  title,
  options,
  selectedOptions,
  onSelectionChange,
  filterType = "checkbox",
  minValue,
  maxValue,
  onRangeChange,
  onSearchChange,
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localMin, setLocalMin] = useState(minValue?.toString() ?? "");
  const [localMax, setLocalMax] = useState(maxValue?.toString() ?? "");
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Trigger search callback when user types 3+ characters for location filter
  useEffect(() => {
    if (
      filterType === "autocomplete" &&
      onSearchChange &&
      searchTerm.length >= 3
    ) {
      onSearchChange(searchTerm.slice(0, 3).toLowerCase());
    }
  }, [searchTerm, filterType, onSearchChange]);

  const isFiltering =
    selectedOptions.length > 0 ||
    (filterType === "range" && (localMin || localMax));

  const handleToggleOption = (optionId: string) => {
    onSelectionChange?.(
      selectedOptions.includes(optionId)
        ? selectedOptions.filter((id) => id !== optionId)
        : [...selectedOptions, optionId],
    );
  };

  const handleClear = () => {
    onSelectionChange?.([]);
    if (filterType === "range" && onRangeChange) {
      setLocalMin("");
      setLocalMax("");
      setRangeError(null);
      onRangeChange(0, 0);
    }
  };

  const handleRangeApply = () => {
    if (!onRangeChange) return;

    // Validate before applying
    const min = localMin ? parseFloat(localMin) : NaN;
    const max = localMax ? parseFloat(localMax) : NaN;

    if (!isNaN(min) && !isNaN(max) && min >= max) {
      setRangeError("Minimum must be less than maximum");
      return;
    }

    // Coerce defaults only when one side is empty
    const appliedMin = !isNaN(min) ? min : 0;
    const appliedMax = !isNaN(max) ? max : 100;

    setRangeError(null);
    onRangeChange(appliedMin, appliedMax);
    return;
  };

  // Validate range live so we can show helpful messaging while typing
  useEffect(() => {
    const min = localMin ? parseFloat(localMin) : NaN;
    const max = localMax ? parseFloat(localMax) : NaN;

    if (!isNaN(min) && !isNaN(max)) {
      if (min >= max) {
        setRangeError("Minimum must be less than maximum");
      } else {
        setRangeError(null);
      }
    } else {
      // If one or both are empty/invalid, clear the error (we validate on apply)
      setRangeError(null);
    }
  }, [localMin, localMax]);

  const displayText = (() => {
    if (filterType === "range") {
      if (localMin && localMax) {
        return `$${localMin}-${localMax}/hr`;
      } else if (localMin) {
        return `$${localMin}/hr+`;
      } else if (localMax) {
        return `Up to $${localMax}/hr`;
      } else {
        return title;
      }
    }

    if (filterType === "rating") {
      if (selectedOptions.length === 0) return title;
      const minRating = Math.min(...selectedOptions.map(Number));
      const maxRating = Math.max(...selectedOptions.map(Number));
      if (minRating === maxRating) {
        return `${minRating}.0+ stars`;
      } else {
        return (
          <div className="flex gap-[5px] items-center">
            {minRating}.0 - {maxRating}.0{" "}
            <Image src="/svg/star.svg" alt="Star icon" width={20} height={20} />
          </div>
        );
      }
    }

    if (selectedOptions.length === 0) return title;

    const firstLabel =
      options.find((opt) => opt.id === selectedOptions[0])?.label ??
      selectedOptions[0];
    const additionalCount =
      selectedOptions.length > 1 ? ` +${selectedOptions.length - 1}` : "";
    return `${firstLabel}${additionalCount}`;
  })();

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderContent = () => {
    if (filterType === "range") {
      return (
        <div className="flex flex-col">
          <div className="flex gap-[10px] items-center">
            <div className="flex-1">
              <label className="text-xs text-cooper-gray-400 mb-1">Min</label>
            </div>
            <div className="w-4" />
            <div className="flex-1">
              <label
                htmlFor="max"
                className="text-xs text-cooper-gray-400 mb-1"
              >
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
          {rangeError && (
            <p className="text-xs text-red-600 mt-2">{rangeError}</p>
          )}
        </div>
      );
    }

    if (filterType === "rating") {
      const minRating =
        selectedOptions.length > 0
          ? Math.min(...selectedOptions.map(Number))
          : 0;
      const maxRating =
        selectedOptions.length > 0
          ? Math.max(...selectedOptions.map(Number))
          : 0;

      const handleRatingClick = (rating: number) => {
        if (selectedOptions.length === 0) {
          // First click - select this rating
          onSelectionChange?.([rating.toString()]);
        } else if (selectedOptions.length === 1) {
          const current = Number(selectedOptions[0]);
          if (rating === current) {
            // Clicking same rating - deselect
            onSelectionChange?.([]);
          } else {
            // Second click - create range
            const min = Math.min(current, rating);
            const max = Math.max(current, rating);
            const range = [];
            for (let i = min; i <= max; i++) {
              range.push(i.toString());
            }
            onSelectionChange?.(range);
          }
        } else {
          // Range exists - clicking sets new single rating
          onSelectionChange?.([rating.toString()]);
        }
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
                <Image
                  src="/svg/star.svg"
                  alt="Star icon"
                  width={20}
                  height={20}
                />
                <span className="text-xs">{rating}.0</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (filterType === "autocomplete") {
      return (
        <div>
          <Autocomplete
            options={filteredOptions.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
            value={selectedOptions}
            onChange={(selected) => onSelectionChange?.(selected)}
            placeholder={`Search by ${title === "Industry" ? "industry" : "city or state"}`}
          />
        </div>
      );
    }
    if (filterType === "location") {
      return (
        <div className="flex flex-col gap-3">
          <Autocomplete
            options={filteredOptions.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
            value={selectedOptions}
            onChange={(selected) => {
              onSelectionChange?.(selected);
            }}
            placeholder={`Search by city or state...`}
            onSearchChange={onSearchChange}
          />
        </div>
      );
    } else {
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
  };
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-[10px] rounded-lg px-[14px] py-2 text-sm border border-cooper-gray-150 text-cooper-gray-400 font-normal focus-visible:ring-0 h-9 whitespace-nowrap",
            isFiltering
              ? "border-cooper-gray-600 bg-cooper-gray-700 hover:bg-cooper-gray-200"
              : "bg-white hover:bg-cooper-gray-150",
          )}
        >
          {displayText}
          <ChevronDown className={cn("h-4 w-4", isOpen ? "rotate-180" : "")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex flex-col w-96 gap-[22px] p-5 bg-cooper-cream-400 rounded-lg"
      >
        <DropdownMenuLabel className="flex justify-between p-0 bg-cooper-cream-400">
          <div className="flex gap-2">
            <span className="font-semibold text-base">{title}</span>
            <Button
              className="bg-transparent border-none text-cooper-gray-400 text-xs hover:bg-transparent p-0 h-auto self-center"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            className="bg-transparent border-none text-cooper-gray-400 hover:bg-transparent p-0 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </DropdownMenuLabel>
        <div>{renderContent()}</div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
