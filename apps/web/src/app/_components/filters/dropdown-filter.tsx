"use client";

import { useMemo, useState, forwardRef } from "react";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";

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
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When true, renders only the trigger button (for use with external popover). */
  triggerOnly?: boolean;
  /** Called when the trigger is clicked (only used when triggerOnly is true). */
  onTriggerClick?: () => void;
}

const DropdownFilter = forwardRef<HTMLButtonElement, DropdownFilterProps>(
  function DropdownFilter(
    {
      title,
      options,
      selectedOptions,
      onSelectionChange,
      filterType = "checkbox",
      minValue,
      maxValue,
      onRangeChange,
      onSearchChange,
      open: controlledOpen,
      onOpenChange,
      triggerOnly = false,
      onTriggerClick,
    },
    ref,
  ) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled =
      controlledOpen !== undefined && onOpenChange !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const setIsOpen = isControlled
      ? (value: boolean) => onOpenChange(value)
      : setInternalOpen;

    const isFiltering = useMemo(() => {
      if (filterType === "range") {
        return Boolean(
          (minValue && minValue > 0) ?? (maxValue && maxValue > 0),
        );
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
          <div className="flex gap-[5px] items-center">
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

    const triggerButton = (
      <button
        ref={triggerOnly ? ref : undefined}
        type="button"
        className={cn(
          "flex items-center gap-[10px] rounded-lg px-[14px] py-2 text-sm border border-cooper-gray-150 text-cooper-gray-400 font-normal focus-visible:ring-0 outline-none focus:outline-none h-9 whitespace-nowrap",
          isFiltering
            ? "border-cooper-gray-600 bg-cooper-gray-700 hover:bg-cooper-gray-200"
            : "bg-white hover:bg-cooper-gray-150",
        )}
        onClick={triggerOnly ? onTriggerClick : undefined}
      >
        {displayText}
        <ChevronDown className={cn("h-4 w-4", isOpen ? "rotate-180" : "")} />
      </button>
    );

    if (triggerOnly) {
      return triggerButton;
    }

    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-[10px] rounded-lg px-[14px] py-2 text-sm border border-cooper-gray-150 text-cooper-gray-400 font-normal focus-visible:ring-0 outline-none focus:outline-none h-9 whitespace-nowrap",
              isFiltering
                ? "border-cooper-gray-600 bg-cooper-gray-700 hover:bg-cooper-gray-200"
                : "bg-white hover:bg-cooper-gray-150",
            )}
          >
            {displayText}
            <ChevronDown
              className={cn("h-4 w-4", isOpen ? "rotate-180" : "")}
            />
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
                className="bg-transparent border-none text-cooper-gray-400 font-normal text-xs hover:bg-transparent p-0 h-auto self-center"
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
  },
);

/** Panel content (header + FilterBody) for use inside a single Popover. */
export function FilterPanelContent(
  props: Pick<
    DropdownFilterProps,
    | "title"
    | "options"
    | "selectedOptions"
    | "onSelectionChange"
    | "filterType"
    | "minValue"
    | "maxValue"
    | "onRangeChange"
    | "onSearchChange"
    | "placeholder"
  > & { onClose: () => void },
) {
  const {
    title,
    options,
    selectedOptions,
    onSelectionChange,
    filterType = "checkbox",
    minValue,
    maxValue,
    onRangeChange,
    onSearchChange,
    onClose,
    placeholder,
  } = props;

  const handleClear = () => {
    onSelectionChange?.([]);
    if (filterType === "range" && onRangeChange) {
      onRangeChange(0, 0);
    }
  };

  return (
    <div className="flex flex-col w-96 gap-[22px] p-5 bg-cooper-cream-400 rounded-lg">
      <div className="flex justify-between p-0 bg-cooper-cream-400">
        <div className="flex gap-2">
          <span className="font-semibold text-base">{title}</span>
          <Button
            className="bg-transparent border-none text-cooper-gray-400 font-normal text-xs hover:bg-transparent p-0 h-auto self-center"
            onClick={handleClear}
          >
            Clear
          </Button>
        </div>
        <Button
          onClick={onClose}
          className="bg-transparent border-none text-cooper-gray-400 hover:bg-transparent p-0 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
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
        placeholder={placeholder}
      />
    </div>
  );
}

export default DropdownFilter;
