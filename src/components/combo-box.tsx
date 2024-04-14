import { ChevronsUpDown } from "lucide-react";
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
import { SetStateAction } from "react";

export type ComboBoxOption<T> = {
  value: T;
  label: string;
};

type ComboBoxProps = {
  defaultLabel: string;
  searchPlaceholder: string;
  searchEmpty: string;
  valuesAndLabels: ComboBoxOption<string>[];
  optionToNode: (option: ComboBoxOption<string>) => React.ReactNode;
  isOpen: boolean;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
};

export default function ComboBox({
  defaultLabel,
  searchPlaceholder,
  searchEmpty,
  valuesAndLabels,
  optionToNode,
  isOpen,
  setIsOpen,
}: ComboBoxProps) {
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
            <CommandList>{valuesAndLabels.map(optionToNode)}</CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
