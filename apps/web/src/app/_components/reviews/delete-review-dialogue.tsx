import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";

import { api } from "~/trpc/react";

interface DeleteReviewDialogProps {
  reviewId: string;
  trigger?: ReactNode;
  isDraft?: boolean;
  // Controlled mode, for opening from a menu item instead of a trigger
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteReviewDialog({
  reviewId,
  trigger,
  isDraft,
  open,
  onOpenChange,
}: DeleteReviewDialogProps) {
  const { toast } = useCustomToast();

  const deleteReview = api.review.delete.useMutation({
    onSuccess: () => {
      toast.success(
        `Your ${isDraft ? "draft" : "review"} has been succcessfully deleted`,
      );

      // Refresh the page to update the UI
      window.location.reload();
    },
    onError: () => {
      toast.error("Oops. Please try again.");
    },
  });

  const handleDelete = () => {
    deleteReview.mutate(reviewId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-4 cursor-pointer p-0 hover:bg-transparent"
            >
              <Trash2 className="h-4 w-4 text-cooper-gray-400" />
            </Button>
          )}
        </DialogTrigger>
      )}
      {/* Same layout as the report dialog */}
      <DialogContent className="w-full max-w-md bg-white p-5">
        <DialogHeader>
          <DialogTitle>{`Delete ${isDraft ? "draft" : "review"}?`}</DialogTitle>
          <DialogDescription className="text-cooper-gray-400">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* gap-2 only: DialogFooter's own sm:space-x-2 would double it */}
        <DialogFooter className="mt-2 gap-2 sm:justify-end sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              disabled={deleteReview.isPending}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-[#F6F6F6]"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            disabled={deleteReview.isPending}
            className="h-9 rounded-lg border-none bg-[#f7784e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e5683f]"
            onClick={handleDelete}
          >
            {deleteReview.isPending
              ? "Deleting..."
              : `Delete ${isDraft ? "draft" : "review"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
