"use client";

import { Input } from "../themed/onboarding/input";

interface ReviewSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export default function ReviewSearchBar({
  searchTerm,
  onSearchChange,
  className,
}: ReviewSearchBarProps) {
  return (
    <div className={className}>
      <Input
        value={searchTerm}
        onChange={(e) => {
          onSearchChange(e.target.value);
        }}
        className="!h-10 w-full !border-[0.75px] !border-cooper-gray-400 bg-cooper-gray-100 !text-sm focus:ring-1 focus:ring-cooper-gray-400 focus:ring-offset-0"
        placeholder="Search reviews..."
      />
    </div>
  );
}
