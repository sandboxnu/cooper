"use client";

import { useFormContext } from "react-hook-form";

import { cn } from "@cooper/ui";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@cooper/ui/form";
import { RadioGroup, RadioGroupItem } from "@cooper/ui/radio-group";

import FilterBody from "../filters/filter-body";

// Shared building blocks so every review form field looks and spaces the same

export const FIELD_LABEL_CLASS = "text-sm font-bold text-cooper-gray-400";
// Labels for checkboxes and radio options
export const OPTION_LABEL_CLASS =
  "cursor-pointer text-sm font-normal text-cooper-gray-400";

export function FieldLabel({
  children,
  required = false,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <FormLabel className={cn(FIELD_LABEL_CLASS, className)}>
      {children}
      {required && <span className="text-cooper-red-300">*</span>}
    </FormLabel>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-cooper-gray-350">{children}</p>;
}

// Two short fields side by side on wider screens, stacked on mobile
export function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
  );
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: { id: string; label: string }[];
  required?: boolean;
  // Store the selection as a number (e.g. year, rating)
  numeric?: boolean;
  // Allow typing to filter options, for long lists (e.g. year)
  searchable?: boolean;
  placeholder?: string;
}

// Single-choice dropdown bound to a form field
export function SelectField({
  name,
  label,
  options,
  required = false,
  numeric = false,
  searchable = false,
  // Typeable fields say "Enter", plain dropdowns say "Select"
  placeholder = searchable ? "Enter" : "Select",
}: SelectFieldProps) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const raw = field.value as string | number | null | undefined;
        const selected =
          raw === undefined || raw === null || raw === "" || raw === 0
            ? []
            : [String(raw)];
        return (
          <FormItem className="flex flex-col">
            <FieldLabel required={required}>{label}</FieldLabel>
            <FormControl className="relative w-full">
              <FilterBody
                variant="autocomplete"
                title={label}
                options={options.map((option) => ({
                  ...option,
                  value: option.id,
                }))}
                selectedOptions={selected}
                placeholder={placeholder}
                singleSelect
                searchable={searchable}
                onSelectionChange={(values) => {
                  const value = values[0];
                  field.onChange(
                    value === undefined
                      ? undefined
                      : numeric
                        ? Number(value)
                        : value,
                  );
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

interface YesNoFieldProps {
  name: string;
  label: string;
  // Stored values differ by field ("yes"/"no" vs "true"/"false")
  yesValue?: string;
  noValue?: string;
}

export function YesNoField({
  name,
  label,
  yesValue = "yes",
  noValue = "no",
}: YesNoFieldProps) {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FieldLabel required>{label}</FieldLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={(field.value as string | undefined) ?? ""}
              className="flex gap-5 pt-1"
            >
              {[
                { value: yesValue, text: "Yes" },
                { value: noValue, text: "No" },
              ].map(({ value, text }) => (
                <FormItem
                  key={value}
                  className="flex items-center gap-2 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem
                      value={value}
                      className="data-[state=checked]:border-cooper-blue-600 data-[state=checked]:bg-cooper-blue-600"
                    />
                  </FormControl>
                  <FormLabel className={OPTION_LABEL_CLASS}>{text}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
