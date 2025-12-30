import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";

import { Checkbox } from "./checkbox";

interface Option {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: Option[];
  placeholder?: string;
  value?: string[];
  onChange: (value: string[]) => void;
  onSearchChange?: (search: string) => void;
}

export default function Autocomplete({
  options,
  placeholder = "Search...",
  value = [],
  onChange,
  onSearchChange,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, options]);

  const displayValue = search;

  // Calculate dropdown position
  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        width: `${rect.width}px`,
      });
    }
  }, [open]);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleClearAll = () => {
    setSearch("");
    onChange([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="border-cooper-gray-150 focus:none flex h8 w-full rounded-md border bg-white px-[14px] py-2 text-sm placeholder:text-cooper-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            onSearchChange?.(e.target.value);
          }}
          onFocus={() => setOpen(true)}
        />
        {search || value.length > 0 ? (
          <button
            onClick={handleClearAll}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <MagnifyingGlassIcon className="absolute right-2 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2 opacity-50" />
        )}
      </div>

      {/* Selected items badges */}
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((val) => {
            const option = options.find((opt) => opt.value === val);
            if (!option) return null;
            return (
              <span
                key={val}
                className="border-cooper-gray-150 hover:bg-cooper-gray-150 inline-flex items-center gap-[6px] rounded-[8px] border bg-white py-2 pl-[14px] pr-3 text-sm font-medium text-cooper-gray-400"
              >
                {option.label}
                <button
                  onClick={() => handleRemove(val)}
                  className="text-cooper-gray-400"
                >
                  <X className="h-5 w-5 rounded-full p-1 hover:cursor-pointer hover:bg-cooper-gray-400/20" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => {
              setOpen(false);
              setSearch("");
            }}
          />
          <div
            className="border-cooper-gray-150 z-[101] mt-1 rounded-md border bg-white shadow-lg"
            style={dropdownStyle}
          >
            <div className="max-h-60 overflow-auto p-1">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  No results found.
                </div>
              ) : (
                filtered.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      className="hover:bg-cooper-gray-150 flex w-full items-center gap-2 rounded-sm px-[14px] py-2 hover:cursor-pointer"
                      onClick={() => handleToggle(option.value)}
                    >
                      <Checkbox checked={isSelected} />
                      <label className="flex-1 cursor-pointer text-left text-sm text-cooper-gray-400">
                        {option.label}
                      </label>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
