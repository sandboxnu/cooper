import type { ReactNode } from "react";
import React from "react";

interface ModalContainerProps {
  children: ReactNode;
  title?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ children, title }) => {
  return (
    <div className="h-fit w-full flex-wrap gap-12 rounded-lg border border-[#EBEBEB] bg-white px-6 py-5">
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
