import React, { ReactNode } from "react";

interface ModalContainerProps {
  children: ReactNode;
}

const ModalContainer: React.FC<ModalContainerProps> = ({ children }) => {
  return (
    <div
      className={`w-[1018px] rounded-lg border border-[#EBEBEB] bg-white px-[24px] py-[20px]`}
    >
      {children}
    </div>
  );
};

export default ModalContainer;
