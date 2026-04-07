import type { ReactNode } from "react";
import React from "react";

interface ModalContainerProps {
  children: ReactNode;
  title?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ children, title }) => {
  return (
    <div className="h-fit w-full flex-wrap gap-12 rounded-lg border border-[#EBEBEB] bg-white px-[24px] py-[20px]">
      {title && (
        <p className="mb-3 text-[18px] font-medium tracking-[-0.18px] text-[#151515]">
          {title}
        </p>
      )}
      {children}
    </div>
  );
};

export default ModalContainer;
