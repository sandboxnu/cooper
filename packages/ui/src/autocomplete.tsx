import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { ChevronDown, X } from "lucide-react";

import { cn } from ".";
import { Checkbox } from "./checkbox";
import { useReadOnly } from "./read-only";

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
  /** When true, only one option can be selected; selection is shown in the bar and dropdown closes on select. */
  singleSelect?: boolean;
  /** When false (singleSelect only), the input can't be typed in and acts as a plain dropdown. */
  searchable?: boolean;
  // whether the autocomplete is rendered within a menu content (for positioning)
  isInMenuContent?: boolean;
  portalZIndex?: number;
}

export default function Autocomplete({
  options,
  placeholder = "Search...",
  value = [],
  onChange,
  onSearchChange,
  singleSelect = false,
  searchable = true,
  isInMenuContent = false,
  portalZIndex = 200,
}: AutocompleteProps) {
  const readOnly = useReadOnly();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const portalDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (portalDropdownRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-autocomplete-portal]")
      ) {
        return;
      }
      setOpen(false);
      setSearch("");
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const dialogHost = containerRef.current?.closest('[role="dialog"]');
    setPortalHost((dialogHost as HTMLElement | null) ?? document.body);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, options]);

  const selectedLabel =
    singleSelect && value.length === 1
      ? (options.find((o) => o.value === value[0])?.label ?? "")
      : "";
  const isDropdown = singleSelect && !searchable;
  const displayValue = isDropdown
    ? selectedLabel
    : singleSelect && !open && selectedLabel
      ? selectedLabel
      : search;

  const updateDropdownPosition = useMemo(
    () => () => {
      if (!inputRef.current) return;
      const rect = inputRef.current.getBoundingClientRect();
      const mobile = rect.width < 120;
      setDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + (isInMenuContent ? 0 : 4)}px`,
        left: `${rect.left}px`,
        width: `${mobile ? rect.width * 2.1 : rect.width}px`,
      });
    },
    [isInMenuContent],
  );

  // Position dropdown directly below the input; use layout effect so rect is correct after open
  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    const originalOverflow = document.body.style.overflow;

    const handleScrollOrResize = () => updateDropdownPosition();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open, updateDropdownPosition]);

  const handleToggle = (optionValue: string) => {
    if (singleSelect) {
      onChange([optionValue]);
      setOpen(false);
      setSearch("");
      return;
    }
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
    <div ref={containerRef} className="relative w-full">
      {/* Read-only multi-selects show just their chips (or "None selected") */}
      {readOnly && !singleSelect && value.length === 0 && (
        <p className="text-sm text-cooper-gray-400">None selected</p>
      )}
      <div className={cn("relative", readOnly && !singleSelect && "hidden")}>
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "border-cooper-gray-150 focus:none flex w-full rounded-md border bg-white pl-[14px] pr-14 placeholder:text-cooper-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 py-2 text-sm hover:bg-[#F6F6F6] focus:bg-white",
            isDropdown && "cursor-pointer caret-transparent",
          )}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            onSearchChange?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) {
              e.preventDefault();
              const trimmed = search.trim();
              const exactMatch = filtered.find(
                (opt) => opt.label.toLowerCase() === trimmed.toLowerCase(),
              );
              const toSelect = exactMatch ?? filtered[0];
              if (toSelect) {
                handleToggle(toSelect.value);
                setSearch("");
                onSearchChange?.("");
              }
            }
          }}
          onFocus={() => {
            setOpen(true);
            if (singleSelect && value.length === 1) setSearch("");
          }}
          onMouseDown={(e) => {
            if (open) {
              e.preventDefault();
              setOpen(false);
              setSearch("");
            } else if (inputRef.current === document.activeElement) {
              setOpen(true);
              if (singleSelect && value.length === 1) setSearch("");
            }
          }}
          readOnly={isDropdown || (singleSelect && !open && value.length === 1)}
        />
        {/* Clear X sits beside the chevron (dropdown) or search icon (typeable) */}
        {!readOnly && (
          <div className="pointer-events-none absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {(search || value.length > 0) && (
              <button
                type="button"
                aria-label="Clear selection"
                onClick={handleClearAll}
                className="pointer-events-auto text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isDropdown ? (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5 shrink-0 opacity-50" />
            )}
          </div>
        )}
      </div>

      {open && isInMenuContent && (
        <div className="border-cooper-gray-150 absolute left-0 right-0 top-full z-[101] mt-1 rounded-md border bg-white shadow-lg">
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
                    type="button"
                    className={`flex w-full items-center gap-2 rounded-sm px-[14px] py-2 hover:cursor-pointer ${isSelected ? "bg-cooper-gray-150" : "hover:bg-[#F6F6F6]"}`}
                    onClick={() => handleToggle(option.value)}
                  >
                    {!singleSelect && <Checkbox checked={isSelected} />}
                    <label className="flex-1 cursor-pointer text-left text-sm text-cooper-gray-400">
                      {option.label}
                    </label>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      {open &&
        !isInMenuContent &&
        portalHost &&
        createPortal(
          <div
            ref={portalDropdownRef}
            data-autocomplete-portal=""
            className="border-cooper-gray-150 rounded-md border bg-white shadow-lg"
            style={{ ...dropdownStyle, zIndex: portalZIndex }}
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
                      type="button"
                      className={`flex w-full items-center gap-2 rounded-sm px-[14px] py-2 hover:cursor-pointer ${isSelected ? "bg-cooper-gray-150" : "hover:bg-[#F6F6F6]"}`}
                      onClick={() => handleToggle(option.value)}
                    >
                      {!singleSelect && <Checkbox checked={isSelected} />}
                      <label className="flex-1 cursor-pointer text-left text-sm text-cooper-gray-400">
                        {option.label}
                      </label>
                    </button>
                  );
                })
              )}
            </div>
          </div>,
          portalHost,
        )}
      {!open && value.length > 0 && !singleSelect && (
        <div className={cn("flex flex-wrap gap-1", !readOnly && "mt-2")}>
          {value.map((val) => {
            const option = options.find((opt) => opt.value === val);
            if (!option) return null;
            return (
              <span
                key={val}
                className={cn(
                  "border-cooper-gray-150 inline-flex items-center gap-[6px] border text-sm font-medium text-cooper-gray-400",
                  // Read-only chips are smaller, light gray, with no remove X
                  readOnly
                    ? "rounded-md bg-[#F6F6F6] px-2.5 py-1"
                    : "rounded-[8px] bg-white py-2 pl-[14px] pr-3 hover:bg-[#F6F6F6]",
                )}
              >
                {option.label}
                {!readOnly && (
                  <button
                    onClick={() => handleRemove(val)}
                    className="text-cooper-gray-400"
                  >
                    <X className="h-5 w-5 rounded-full p-1 hover:cursor-pointer hover:bg-cooper-gray-400/20" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
