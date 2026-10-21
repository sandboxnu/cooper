import { ChevronLeft } from "lucide-react";

import { cn } from "@cooper/ui";

// Mobile-only back chevron shown above the job and company views
export function BackButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick}
      className={cn("block w-fit text-cooper-gray-400 md:hidden", className)}
    >
      <ChevronLeft size={20} strokeWidth={2.5} />
    </button>
  );
}
