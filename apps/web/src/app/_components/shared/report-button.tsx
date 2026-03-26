"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { ReportReasonType } from "@cooper/db/schema";
import { ReportReason } from "@cooper/db/schema";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cooper/ui/dialog";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { Label } from "@cooper/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@cooper/ui/select";
import { Textarea } from "@cooper/ui/textarea";

import { api } from "~/trpc/react";

interface ReportButtonProps {
  entityType: "role" | "company" | "review";
  entityId: string;
}

export function ReportButton({ entityType, entityId }: ReportButtonProps) {
  const { toast } = useCustomToast();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReasonType | "">("");
  const [reportDescription, setReportDescription] = useState("");

  const createReport = api.report.create.useMutation({
    onSuccess: () => {
      toast.success("Thanks for your report. Our team will review it.");
      setIsOpen(false);
      setReason(reason);
      setReportDescription(reportDescription);
    },
    onError: (err) => {
      toast.error(err.message || "Unable to submit report. Please try again.");
    },
  });

  const closeReportModal = () => {
    if (createReport.isPending) return;
    setIsOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reason) {
      toast.error("Please select a report reason.");
      return;
    }

    const trimmedDescription = reportDescription.trim();
    if (!trimmedDescription) {
      toast.error("Please enter a report description.");
      return;
    }

    createReport.mutate({
      entityType,
      entityId,
      reason,
      reportText: trimmedDescription,
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-700"
      >
        Report
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full max-w-md bg-white p-5">
          <DialogHeader>
            <DialogTitle>Report content</DialogTitle>
            <DialogDescription>
              Tell us what is wrong and why this should be reviewed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-reason">Reason</Label>
              <Select
                value={reason}
                onValueChange={(value) => setReason(value as ReportReasonType)}
              >
                <SelectTrigger id="report-reason" className="bg-white">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ReportReason).map((reasonOption) => (
                    <SelectItem key={reasonOption} value={reasonOption}>
                      {reasonOption
                        .split("_")
                        .map(
                          (word) =>
                            word.charAt(0) + word.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Add details to help moderators understand the issue"
                value={reportDescription}
                onChange={(event) => setReportDescription(event.target.value)}
                className="min-h-[120px] border border-gray-300 text-base"
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                className="px-3 py-2 text-sm font-semibold  h-9 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-black"
                onClick={closeReportModal}
                disabled={createReport.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createReport.isPending}
                className="px-3 py-2 text-sm font-semibold  h-9 rounded-lg border-none"
              >
                {createReport.isPending ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
