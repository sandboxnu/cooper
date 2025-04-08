import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@cooper/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@cooper/ui/popover";

export interface ComboBoxOption<T> {
  value: T;
  label: string;
}

interface ComboBoxProps {
  defaultLabel: string;
  searchPlaceholder: string;
  searchEmpty: string;
  valuesAndLabels: ComboBoxOption<string>[];
  currLabel: string;
  onSelect: (option: string) => void;
  triggerClassName?: string;
  onChange?: (value: string) => void;
  variant?: "default" | "form" | "filtering";
}

/**
 * A combo box, modified from https://ui.shadcn.com/docs/components/combobox
 *
 * @returns A combo box
 */
export default function ComboBox({
  defaultLabel,
  searchPlaceholder,
  searchEmpty,
  valuesAndLabels,
  currLabel,
  onSelect,
  triggerClassName,
  onChange,
  variant,
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const styleVariant =
    variant === "form"
      ? "flex h-16 w-full rounded-md border-[3px] border-cooper-blue-600 bg-white px-3 py-2 text-xl font-normal ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      : variant === "filtering"
        ? "w-[21rem] h-12 rounded-none border-[0.75px] border-l-0 border-t-0 border-cooper-gray-400 text-lg placeholder:opacity-50 focus:ring-0 active:ring-0 lg:rounded-md lg:border-[0.75px] py-0"
        : "h-8 py-0";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        className={cn(
          "overflow-hidden file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
          variant !== "filtering" ? "w-[400px]" : "",
        )}
      >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            styleVariant,
            "justify-between overflow-hidden text-ellipsis text-nowrap h-12 py-0 min-h-0",
            variant !== "filtering" ? "w-[400px]" : "",
          )}
        >
          <span
            className={`overflow-hidden text-lg whitespace-nowrap ${defaultLabel === "Location" ? "text-cooper-gray-400" : "text-gray"}`}
          >
            {defaultLabel}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            onChangeCapture={(e) =>
              onChange && onChange((e.target as HTMLInputElement).value)
            }
          />
          <CommandEmpty>{searchEmpty}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {valuesAndLabels.map((option: ComboBoxOption<string>) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={(option) => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currLabel === option.label ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
