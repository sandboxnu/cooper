import React from "react";

import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cooper/ui/dialog";

interface PopupProps {
  onSave: () => void;
  onCancel: () => void;
  onDiscard: () => void;
  showModal: boolean;
}

const SECONDARY_BUTTON_CLASS =
  "h-9 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-[#F6F6F6]";

// Same layout and buttons as the delete review dialog
const Popup: React.FC<PopupProps> = ({
  showModal,
  onCancel,
  onDiscard,
  onSave,
}) => {
  return (
    <Dialog open={showModal} onOpenChange={(open) => !open && onCancel()}>
      {/* Narrow and tall: text top-left, buttons pinned bottom-right */}
      <DialogContent className="flex min-h-[200px] w-full max-w-[300px] flex-col justify-between bg-white p-6 sm:max-w-[300px]">
        <DialogHeader className="text-left">
          <DialogTitle>Save draft?</DialogTitle>
          <DialogDescription className="text-cooper-gray-400">
            You can continue editing your review from the profile page.
          </DialogDescription>
        </DialogHeader>

        {/* gap-2 only: DialogFooter's own sm:space-x-2 would double it */}
        <DialogFooter className="flex-row justify-end gap-2 sm:space-x-0">
          <Button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={SECONDARY_BUTTON_CLASS}
            onClick={onDiscard}
          >
            Discard
          </Button>
          <Button
            type="button"
            className="h-9 rounded-lg border-none bg-cooper-gray-550 px-3 py-2 text-sm font-semibold text-white hover:bg-cooper-gray-600"
            onClick={onSave}
          >
            Save draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Popup;
