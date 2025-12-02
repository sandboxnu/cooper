import { useState, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
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
          className="flex h-10 w-full rounded-md border border-cooper-gray-150 bg-white px-[14px] py-2 text-sm placeholder:text-cooper-gray-400 focus:outline-none  focus:none disabled:cursor-not-allowed disabled:opacity-50"
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
          <MagnifyingGlassIcon className=" absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50" />
        )}
      </div>

      {/* Selected items badges */}
      {value.length > 0 && !search && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((val) => {
            const option = options.find((opt) => opt.value === val);
            if (!option) return null;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-[6px] rounded-[8px] bg-white py-2 pl-[14px] pr-3 text-sm font-medium text-cooper-gray-400 border-cooper-gray-150 border hover:bg-cooper-gray-150"
              >
                {option.label}
                <button
                  onClick={() => handleRemove(val)}
                  className="text-cooper-gray-400"
                >
                  <X className="h-5 w-5 hover:bg-cooper-gray-400/20 rounded-full p-1 hover:cursor-pointer" />
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
            className="z-[101] rounded-md border border-cooper-gray-150 bg-white shadow-lg mt-1"
            style={dropdownStyle}
          >
            <div className="max-h-60 overflow-auto p-1 ">
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
                      className="flex items-center gap-2 py-2 px-[14px] hover:bg-cooper-gray-150 w-full hover:cursor-pointer"
                      onClick={() => handleToggle(option.value)}
                    >
                      <Checkbox checked={isSelected} />
                      <label className="text-sm cursor-pointer flex-1 text-cooper-gray-400 text-left">
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
