"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import type { FilterOption, FilterVariant } from "./filter-body";
import FilterBody from "./filter-body";

interface DropdownFilterProps {
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  onSelectionChange?: (selected: string[]) => void;
  placeholder?: string;
  filterType?: FilterVariant;
  minValue?: number;
  maxValue?: number;
  onRangeChange?: (min: number, max: number) => void;
  onSearchChange?: (search: string) => void;
  isLoadingOptions?: boolean;
  /** Render dropdown above the trigger to avoid being cut off near bottom of viewport */
  side?: "top" | "bottom";
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
  side = "bottom",
}: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isFiltering = useMemo(() => {
    if (filterType === "range") {
      return Boolean((minValue && minValue > 0) ?? (maxValue && maxValue > 0));
    }
    return selectedOptions.length > 0;
  }, [filterType, selectedOptions.length, minValue, maxValue]);

  const handleClear = () => {
    onSelectionChange?.([]);
    if (filterType === "range" && onRangeChange) {
      onRangeChange(0, 0);
    }
  };

  const displayText = useMemo(() => {
    if (filterType === "range") {
      const min = minValue ?? 0;
      const max = maxValue ? (maxValue !== Infinity ? maxValue : 0) : 0;

      if (min > 0 && max > 0) return `$${min}-${max}/hr`;
      if (min > 0) return `$${min}/hr+`;
      if (max > 0) return `Up to $${max}/hr`;
      return title;
    }

    if (filterType === "rating") {
      if (selectedOptions.length === 0) return title;
      const minRating = Math.min(...selectedOptions.map(Number));
      const maxRating = Math.max(...selectedOptions.map(Number));
      if (minRating === maxRating) return `${minRating}.0+ stars`;

      return (
        <div className="flex items-center gap-[5px]">
          {minRating}.0 - {maxRating}.0{" "}
          <Image src="/svg/star.svg" alt="Star icon" width={20} height={20} />
        </div>
      );
    }

    if (selectedOptions.length === 0) return title;

    const firstLabel =
      options.find((opt) => opt.id === selectedOptions[0])?.label ??
      selectedOptions[0];
    const additionalCount =
      selectedOptions.length > 1 ? ` +${selectedOptions.length - 1}` : "";
    return `${firstLabel}${additionalCount}`;
  }, [filterType, maxValue, minValue, options, selectedOptions, title]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "border-cooper-gray-150 flex h-9 items-center gap-[10px] whitespace-nowrap rounded-lg border px-[14px] py-2 text-sm font-normal text-cooper-gray-400 outline-none focus:outline-none focus-visible:ring-0",
            isFiltering
              ? "border-cooper-gray-600 bg-cooper-gray-700 hover:bg-cooper-gray-200"
              : "hover:bg-cooper-gray-150 bg-white",
          )}
        >
          {displayText}
          <ChevronDown className={cn("h-4 w-4", isOpen ? "rotate-180" : "")} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side={side}
        className="bg-cooper-cream-400 flex w-96 flex-col gap-[22px] rounded-lg p-5"
      >
        <DropdownMenuLabel className="bg-cooper-cream-400 flex justify-between p-0">
          <div className="flex gap-2">
            <span className="text-base font-semibold">{title}</span>
            <Button
              className="h-auto self-center border-none bg-transparent p-0 text-xs font-normal text-cooper-gray-400 hover:bg-transparent"
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            className="h-auto border-none bg-transparent p-0 text-cooper-gray-400 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        </DropdownMenuLabel>

        <FilterBody
          variant={filterType}
          title={title}
          options={options}
          selectedOptions={selectedOptions}
          onSelectionChange={onSelectionChange}
          minValue={minValue}
          maxValue={maxValue}
          onRangeChange={onRangeChange}
          onSearchChange={onSearchChange}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
