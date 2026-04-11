import type { ReactNode } from "react";
import React from "react";

interface InfoCardProps {
  title: string;
  children: ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children }) => {
  return (
    <div className="flex h-full flex-col rounded-lg border-[0.75px] border-cooper-gray-400">
      <div className="flex items-center rounded-t-lg border-b-[0.75px] border-cooper-gray-400 bg-gray-50 p-3 pl-6">
        {title}
      </div>
      <div className="flex-grow rounded-lg bg-white p-6">{children}</div>
    </div>
  );
};

export default InfoCard;
