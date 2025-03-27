import type { ReactNode } from "react";
import React from "react";

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-black">
      <div className="flex items-center rounded-t-lg border-b border-black bg-cooper-gray-200 p-3 pl-6">
        {title}
      </div>
      <div className="flex-grow p-6">{children}</div>
    </div>
  );
};

export default InfoCard;
