import type { ReactNode } from "react";
import React from "react";

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col rounded-lg border border-black">
      <div className="flex items-center rounded-t-lg border-b border-black bg-cooper-gray-200 p-3">
        {title}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default InfoCard;
