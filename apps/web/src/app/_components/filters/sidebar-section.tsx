import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import type { FilterOption, FilterVariant } from "./filter-body";
import FilterBody from "./filter-body";

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
    <div className="flex flex-col gap-[9px]">
      <div className="flex items-end gap-2">
        <span
          className={cn(
            "text-cooper-gray-550 text-base/5 font-semibold",
            variant == "subsection" && "text-sm",
          )}
        >
          {title}
        </span>
        {variant === "main" && (
          <Button
            className="h-auto self-center border-none bg-transparent p-0 text-xs font-normal text-cooper-gray-400 hover:bg-transparent"
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
