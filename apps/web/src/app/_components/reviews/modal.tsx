import type { ReactNode } from "react";
import React from "react";

import { cn } from "@cooper/ui";

interface ModalContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  title,
  className,
}) => {
  return (
    <div
      className={cn(
        "h-fit w-full flex-wrap gap-12 rounded-lg border border-[#EBEBEB] bg-white px-6 py-5",
        className,
      )}
    >
      {title && (
        <p className="mb-3 text-lg font-medium tracking-[-0.18px] text-cooper-gray-900">
          {title}
        </p>
      )}
      {children}
    </div>
  );
};

export default ModalContainer;
