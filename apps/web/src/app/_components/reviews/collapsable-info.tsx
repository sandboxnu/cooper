import type { ReactNode } from "react";
import React, { useState } from "react";

interface CollapsableInfoCardProps {
  title: string;
  children: ReactNode;
}

const CollapsableInfoCard: React.FC<CollapsableInfoCardProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex h-full flex-col rounded-lg border-[0.75px] border-cooper-gray-400 bg-white duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center gap-2 border-b-[0.75px] bg-gray-50 p-4 font-medium transition-colors hover:bg-gray-100 ${
          isExpanded ? "rounded-t-lg border-cooper-gray-400" : "rounded-lg"
        }`}
      >
        <svg
          className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span>{title}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex-grow space-y-2 p-6">{children}</div>
      </div>
    </div>
  );
};

export default CollapsableInfoCard;
