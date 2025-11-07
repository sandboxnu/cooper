import { Button } from "@cooper/ui/button";

import * as React from "react";

import { cn } from "@cooper/ui";

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
          "rounded-lg px-4 py-2 text-sm border border-cooper-gray-150 text-cooper-gray-400 hover:bg-cooper-gray-150",
          selected
            ? "bg-cooper-cream-300 "
            : "bg-white hover:bg-cooper-gray-150",
        )}
        onClick={onClick}
      >
        {label}
      </Button>
    );
  },
);

export { Chip };
