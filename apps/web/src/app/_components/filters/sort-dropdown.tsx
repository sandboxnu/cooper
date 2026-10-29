"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@cooper/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cooper/ui/dropdown-menu";

import { MENU_CONTENT_CLASS, MENU_ITEM_CLASS } from "../shared/menu-styles";

interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string> {
  options: SortOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  className?: string;
}

// "Sort by" menu with the filter dropdowns' gray text and rounded panel
export function SortDropdown<T extends string>({
  options,
  value,
  onChange,
  className,
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 whitespace-nowrap text-sm text-cooper-gray-400 outline-none",
          className,
        )}
      >
        Sort by: <span className="text-cooper-gray-900">{selected?.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={MENU_CONTENT_CLASS}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
              className={cn(
                MENU_ITEM_CLASS,
                "justify-between",
                isSelected && "text-cooper-gray-900",
              )}
            >
              {option.label}
              {isSelected && <Check />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
