import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "./index";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  const handlePrevious = () => {
    if (canGoBack) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        onClick={handlePrevious}
        disabled={!canGoBack}
        className={cn(
          "border-cooper-gray-150 text-cooper-gray-600 hover:bg-cooper-gray-50 flex h-8 w-8 items-center justify-center rounded-md border bg-white transition-colors",
          !canGoBack &&
            "bg-cooper-cream-300 hover:bg-cooper-cream-300 cursor-not-allowed opacity-75",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="text-cooper-gray-600 text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={!canGoForward}
        className={cn(
          "border-cooper-gray-150 text-cooper-gray-600 hover:bg-cooper-gray-50 flex h-8 w-8 items-center justify-center rounded-md border bg-white transition-colors",
          !canGoForward &&
            "bg-cooper-cream-300 hover:bg-cooper-cream-300 cursor-not-allowed opacity-75",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
