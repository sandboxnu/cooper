const Popup = () => {
  return (
    <div
      className={
        "mb-[28px] flex h-fit w-[458px] flex-col rounded-[10px] bg-white p-[24px] shadow-sm shadow-black blur-[10]"
      }
    >
      <div className={"mb-[8px] flex items-center justify-between text-base font-bold text-black"}>
        <span>Save as Draft?</span>
        <button
          className={
            "flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-500"
          }
        >
          X
        </button>
      </div>
      <div
        className={
          "mb-[8px] py-[8px] text-sm font-semibold text-cooper-gray-400"
        }
      >
        We’ll save what you’ve written so far, and you can continue editing your
        review anytime.
      </div>
      <div className={"flex w-full items-center justify-between text-[12px]"}>
        <button
          className={
            "rounded-[4px] border border-gray-400 px-[8px] py-[4px] text-cooper-gray-400"
          }
        >
          Cancel
        </button>
        <div className={"flex gap-[20px]"}>
          <button className={"hover:text-cooper-gray-500 text-cooper-gray-400"}>
            Discard
          </button>
          <button
            className={
              "rounded-[4px] bg-orange-400 px-[8px] py-[4px] text-white"
            }
          >
            Save Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
