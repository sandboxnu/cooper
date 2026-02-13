import React, { ReactNode } from "react";

interface ModalContainerProps {
  children: ReactNode;
  title?: string;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ children, title }) => {
  return (
    <div title = {title}
      className={`w-[1018px] rounded-lg border border-[#EBEBEB] bg-white px-[24px] py-[20px]`}
    >
      {children}
    </div>
  );
};

export default ModalContainer;
