import type { ReactNode } from "react";
import React, { useState } from "react";

interface FormCollapsableInfoCardProps {
  title: string;
  children: ReactNode;
}

const FormCollapsableInfoCard: React.FC<FormCollapsableInfoCardProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex h-full flex-col rounded-lg border-1 border-cooper-gray-150 bg-white duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex w-full items-center gap-2 border-b-[0.75px] bg-cooper-gray-100 p-3 pl-4 text-md font-semibold transition-colors hover:bg-gray-100 ${
          isExpanded ? "rounded-t-lg" : "rounded-lg"
        }`}
      >
        <span>{title}</span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isExpanded ? "h-fit opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex-grow space-y-2">{children}</div>
      </div>
    </div>
  );
};

export default FormCollapsableInfoCard;
