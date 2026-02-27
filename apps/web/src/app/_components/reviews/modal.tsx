import React, { ReactNode } from "react";

interface ModalContainerProps {
  children: ReactNode;
  title?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ children, title }) => {
  return (
    <div
      title={title}
      className={`left-[20px] top-[289px] h-fit max-w-[1018px] flex-wrap gap-12 rounded-lg border border-[#EBEBEB] bg-white px-[24px] py-[20px]`}
    >
      {children}
    </div>
  );
};

export default ModalContainer;
