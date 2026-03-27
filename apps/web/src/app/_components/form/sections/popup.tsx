import React from "react";

interface PopupProps {
  onSave: () => void;
  onCancel: () => void;
  onDiscard: () => void;
  showModal: boolean;
}

const Popup: React.FC<PopupProps> = ({
  showModal,
  onCancel,
  onDiscard,
  onSave,
}) => {
  if (!showModal) {
    return null;
  }

  return (
    <>
      {/* Non Mobile Popup */}
      <div className="hidden md:flex">
        <div
          className={
            "mb-[28px] flex h-fit w-[400px] flex-col rounded-[10px] bg-white p-[20px] lg-shadow"
          }
        >
          <div className={"flex justify-end"}>
            <button
              type="button"
              className={
                "flex h-4 w-4 items-center justify-center rounded-full bg-gray-300 text-[9px] font-bold text-gray-500"
              }
              onClick={onCancel}
            >
              X
            </button>
          </div>
          <div
            className={"flex text-[22px] font-semibold text-[#151515] -mt-2"}
          >
            <span>Save as Draft?</span>
          </div>
          <div
            className={
              "mb-[12px] py-[8px] text-base font-semibold text-cooper-gray-400"
            }
          >
            We'll save what you've written so far, and you can continue editing
            your review anytime.
          </div>
          <div
            className={"flex w-full items-center justify-between text-[12px]"}
          >
            <button
              type="button"
              className={
                "rounded-[6px] border border-gray-200 px-[10px] py-[6px] text-cooper-gray-400 text-sm"
              }
              onClick={onCancel}
            >
              Cancel
            </button>
            <div className={"flex gap-[8px]"}>
              <button
                type="button"
                className={
                  "rounded-[6px] border border-gray-200 px-[10px] py-[6px] text-cooper-gray-400 text-sm"
                }
                onClick={onDiscard}
              >
                Do not save
              </button>
              <button
                type="button"
                className={
                  "rounded-[6px] bg-[#FFA400] px-[10px] py-[6px] text-white text-sm"
                }
                onClick={onSave}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Popup */}
      <div className="flex w-full flex-col items-center justify-center md:hidden">
        <div className="absolute bottom-20 flex flex-col w-full h-[200px] max-w-sm rounded-lg bg-white p-6 shadow-lg px-[13px]">
          <div className="mb-[8px] text-[#151515] text-xl font-semibold text-center">
            Save as Draft?
          </div>
          <div className="mb-[8px] text-cooper-gray-400 text-base text-center">
            We'll save what you've written so far, and you can continue editing
            your review anytime.
          </div>

          <div className="border border-cooper-gray-200 flex-grow -mx-3"></div>

          <div className="mt-[6px] flex flex-col gap-[8px] w-full">
            <button
              type="button"
              className={"mb-[8px] text-orange-400 w-full text-sm"}
              onClick={onSave}
            >
              Save Draft
            </button>

            <div className="border border-cooper-gray-200 flex-grow -mx-3"></div>

            <button
              type="button"
              className={
                "hover:text-cooper-gray-500 text-cooper-gray-400 w-full text-sm"
              }
              onClick={onDiscard}
            >
              Discard
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center h-[40px] absolute bottom-5 flex-col w-full max-w-sm rounded-lg bg-white shadow-lg">
          <button
            type="button"
            className={"text-cooper-gray-400 w-full text-sm"}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default Popup;
