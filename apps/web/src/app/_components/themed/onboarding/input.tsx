import { X } from "lucide-react";

import { Input as InputPrimitive } from "@cooper/ui/input";

interface InputProps extends React.ComponentProps<typeof InputPrimitive> {
  onClear?: () => void;
}

export function Input({ onClear, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <InputPrimitive
        className="border-cooper-gray-150 h-9 rounded-lg border pr-10 text-sm shadow-none hover:bg-accent"
        {...props}
      />
      {onClear && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="pointer-events-auto flex items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Clear input"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
