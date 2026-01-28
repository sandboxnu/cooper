import { Button } from "@cooper/ui/button";
import FilterBody from "./filter-body";
import type { FilterOption, FilterVariant } from "./filter-body";

import { cn } from "@cooper/ui";

interface SidebarSectionProps {
  title: string;
  options: FilterOption[];
  selectedOptions: string[];
  onSelectionChange?: (selected: string[]) => void;
  filterType?: FilterVariant;
  onSearchChange?: (search: string) => void;
  isLoadingOptions?: boolean;
  onRangeChange?: (min: number, max: number) => void;
  minValue?: number;
  maxValue?: number;
  variant?: "main" | "subsection";
}

/**
 * One section of the sidebar filter, including title, options, and selection handling.
 */
export default function SidebarSection({
  title,
  options,
  selectedOptions,
  onSelectionChange,
  filterType = "checkbox",
  onSearchChange,
  isLoadingOptions,
  onRangeChange,
  minValue,
  maxValue,
  variant = "main",
}: SidebarSectionProps) {
  const handleClear = () => {
    if (filterType === "range") {
      onRangeChange?.(0, 0);
      return;
    }

    onSelectionChange?.([]);
  };

  return (
    <div className="flex flex-col gap-[10px] py-4">
      <div className="flex gap-2 items-end">
        <span
          className={cn(
            "font-semibold text-base text-cooper-gray-550",
            variant == "subsection" && "text-sm",
          )}
        >
          {title}
        </span>
        {variant === "main" && (
          <Button
            className="bg-transparent border-none text-cooper-gray-400 font-normal text-xs hover:bg-transparent p-0 h-auto self-center"
            onClick={handleClear}
          >
            Clear
          </Button>
        )}
      </div>

      <div className="text-cooper-gray-400">
        <FilterBody
          variant={filterType}
          title={title}
          options={options}
          selectedOptions={selectedOptions}
          onSelectionChange={onSelectionChange}
          onRangeChange={onRangeChange}
          minValue={minValue}
          maxValue={maxValue}
          onSearchChange={onSearchChange}
          isLoadingOptions={isLoadingOptions}
        />
      </div>
    </div>
  );
}
