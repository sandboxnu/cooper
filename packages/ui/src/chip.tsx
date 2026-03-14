import * as React from "react";

import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

interface ChipProps {
  label: string;
  onClick?: () => void;
  selected?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ label, onClick, selected = false }: ChipProps, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "border-cooper-gray-150 rounded-lg border px-4 py-2 text-sm text-cooper-gray-400 font-normal",
          selected
            ? "bg-cooper-cream-300 hover:bg-cooper-cream-300"
            : "hover:bg-cooper-gray-150 bg-white",
        )}
        onClick={onClick}
      >
        {label}
      </Button>
    );
  },
);

export { Chip };
