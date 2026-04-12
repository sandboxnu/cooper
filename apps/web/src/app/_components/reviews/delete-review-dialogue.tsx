import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@cooper/ui/button";
import {
  Dialog,
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
}

export function DeleteReviewDialog({
  reviewId,
  trigger,
  isDraft,
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
    <Dialog>
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
      <DialogContent className="w-full max-w-md bg-white pb-8 p-4">
        <DialogHeader className="space-y-4 text-center">
          <DialogTitle className="text-2xl font-semibold">
            {`Delete ${isDraft ? "Draft" : "Review"}`}
          </DialogTitle>
          <DialogDescription className="text-cooper-gray-600 text-base">
            {`Are you sure you want to delete this ${isDraft ? "draft" : "review"}? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-8 flex justify-center">
          <Button
            type="submit"
            className="min-w-[200px] border-none bg-cooper-yellow-500 px-8 py-6 text-base font-medium text-white transition-colors hover:bg-cooper-yellow-300"
            onClick={handleDelete}
          >
            {`Delete ${isDraft ? "Draft" : "Review"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
