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
          "flex h-8 w-8 items-center justify-center rounded-md border border-cooper-gray-150 bg-white text-cooper-gray-600 transition-colors hover:bg-cooper-gray-50",
          !canGoBack &&
            "cursor-not-allowed bg-cooper-cream-300 hover:bg-cooper-cream-300 opacity-75",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <span className="text-sm text-cooper-gray-600">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={!canGoForward}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md border border-cooper-gray-150 bg-white text-cooper-gray-600 transition-colors hover:bg-cooper-gray-50",
          !canGoForward &&
            "cursor-not-allowed bg-cooper-cream-300 hover:bg-cooper-cream-300 opacity-75",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
