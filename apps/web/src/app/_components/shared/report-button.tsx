"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

import type { ReportReasonType } from "@cooper/db/schema";
import { ReportReason } from "@cooper/db/schema";
import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
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
import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";

interface ReportButtonProps {
  entityType: "role" | "company" | "review";
  entityId: string;
  iconOnly?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function ReportButton({
  entityType,
  entityId,
  iconOnly,
  icon,
  className,
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn("text-cooper-gray-300", className)}
      >
        <span className="flex flex-row gap-2">
          {icon ?? (
            <Image
              src="/svg/reviewReport.svg"
              width={16}
              height={16}
              alt="Report"
            />
          )}
          {!iconOnly && "Report"}
        </span>
      </button>
      <ReportDialog
        entityType={entityType}
        entityId={entityId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

interface ReportDialogProps {
  entityType: "role" | "company" | "review";
  entityId: string;
  // Shown in the title as "Report content on [name]"
  entityName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Report form dialog, for opening from a menu item or other custom trigger
export function ReportDialog({
  entityType,
  entityId,
  entityName,
  open: isOpen,
  onOpenChange: setIsOpen,
}: ReportDialogProps) {
  const { toast } = useCustomToast();
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-full max-w-md bg-white p-5">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle>
            {entityName ? (
              <>
                {/* Title is semibold by default; keep only the name bold */}
                <span className="font-normal">Report content on </span>
                <span className="font-bold">{entityName}</span>
              </>
            ) : (
              "Report content"
            )}
          </DialogTitle>
          {/* Goes through closeReportModal so it can't close mid-submit */}
          <button
            type="button"
            aria-label="Close"
            onClick={closeReportModal}
            className="flex h-4 w-4 shrink-0 items-center justify-center"
          >
            <X className="h-4 w-4 text-cooper-gray-900" />
          </button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-[0.5rem]">
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
                  <SelectItem
                    key={reasonOption}
                    value={reasonOption}
                    className="focus:bg-[#F6F6F6]"
                  >
                    {reasonOption
                      .split("_")
                      .map(
                        (word) => word.charAt(0) + word.slice(1).toLowerCase(),
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

          <DialogFooter className="gap-1/2 sm:justify-end">
            <Button
              type="button"
              className="px-3 py-2 text-sm font-semibold  h-9 rounded-lg border border-gray-300 bg-white hover:bg-[#F6F6F6] text-black"
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
  );
}
