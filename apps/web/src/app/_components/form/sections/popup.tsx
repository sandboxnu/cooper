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
            "mb-[28px] flex h-fit w-[458px] flex-col rounded-[10px] bg-white p-[24px] shadow-sm shadow-black blur-[10]"
          }
        >
          <div
            className={
              "mb-[8px] flex items-center justify-between text-base font-bold text-black"
            }
          >
            <span>Save as Draft?</span>
            <button
              type="button"
              className={
                "flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500"
              }
              onClick={onCancel}
            >
              X
            </button>
          </div>
          <div
            className={
              "mb-[8px] py-[8px] text-sm font-semibold text-cooper-gray-400"
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
                "rounded-[4px] border border-gray-400 px-[8px] py-[4px] text-cooper-gray-400"
              }
              onClick={onCancel}
            >
              Cancel
            </button>
            <div className={"flex gap-[20px]"}>
              <button
                type="button"
                className={"hover:text-cooper-gray-500 text-cooper-gray-400"}
                onClick={onDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className={
                  "rounded-[4px] bg-orange-400 px-[8px] py-[4px] text-white"
                }
                onClick={onSave}
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Popup */}
      <div className="flex w-full flex-col items-center justify-center md:hidden">
        <div className="absolute bottom-20 flex flex-col w-full h-[200px] max-w-sm rounded-lg bg-white p-6 shadow-lg px-[13px]">
          <div className="mb-[8px] text-black text-xl font-bold text-center">
            Save as Draft?
          </div>
          <div className="mb-[8px] text-cooper-gray-400 text-base text-center">
            We'll save what you've written so far, and you can continue editing
            your review anytime.
          </div>

          <div className="flex flex-col gap-[12px] w-full">
            <button
              type="button"
              className={"mb-[8px] text-orange-400 w-full"}
              onClick={onSave}
            >
              Save Draft
            </button>

            <button
              type="button"
              className={
                "hover:text-cooper-gray-500 text-cooper-gray-400 w-full"
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
            className={"text-cooper-gray-400 w-full"}
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
