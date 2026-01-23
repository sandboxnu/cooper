import { cn } from "@cooper/ui";
import { X } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string | number; label: string | number }[];
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  className,
  onClear,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-lg border-2 border-cooper-gray-300 bg-transparent px-4 pr-10 text-lg text-cooper-gray-400 shadow-none placeholder:text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* Icons container - X and Chevron on the same line */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-2">
        {onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="pointer-events-auto flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {/* Chevron */}
        <svg
          className="h-6 w-6 fill-current flex-shrink-0 text-cooper-gray-600"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};
