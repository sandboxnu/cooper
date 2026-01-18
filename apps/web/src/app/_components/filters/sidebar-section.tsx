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
  variant = "main",
}: SidebarSectionProps) {
  const handleClear = () => {
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
          onSearchChange={onSearchChange}
          isLoadingOptions={isLoadingOptions}
        />
      </div>
    </div>
  );
}
