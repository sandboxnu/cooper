import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { SetStateAction, useState } from "react";
import { cn } from "~/lib/utils";

export type ComboBoxOption<T> = {
  value: T;
  label: string;
};

type ComboBoxProps = {
  defaultLabel: string;
  searchPlaceholder: string;
  searchEmpty: string;
  valuesAndLabels: ComboBoxOption<string>[];
  currLabel: string;
  onSelect: (option: string) => void;
};

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
}: ComboBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild className="min-w-[400px]">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[180px] justify-between"
        >
          {defaultLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
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
