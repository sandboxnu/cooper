"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type {
  InterviewRoundType,
  JobTypeType,
  StatusType,
  WorkEnvironmentType,
  WorkTermType,
} from "@cooper/db/schema";
import {
  JobType,
  Status,
  WorkEnvironment,
  WorkTerm,
  ZodInterviewDifficultySchema,
  ZodInterviewTypeSchema,
} from "@cooper/db/schema";
import { cn, useCustomToast } from "@cooper/ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cooper/ui/dialog";
import { Form } from "@cooper/ui/form";
import Logo from "@cooper/ui/logo";
import { ReadOnlyContext } from "@cooper/ui/read-only";

import {
  BasicInfoSection,
  CompanyDetailsSection,
  InterviewSection,
  PaySection,
  ReviewSection,
} from "~/app/_components/form/sections";
import { FormSectionBlock } from "~/app/_components/form/form-section";
import { PortalZIndexContext } from "~/contexts/portal-z-index";
import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";

import { logoBoxClass, RoleHeader } from "../roles/role-header";
import { DeleteReviewDialog } from "./delete-review-dialogue";

const filter = new Filter();

const formSchema = z.object({
  workTerm: z.nativeEnum(WorkTerm, {
    required_error: "You need to select a co-op cycle.",
  }),
  workYear: z.coerce
    .number({
      errorMap: () => ({ message: "Please select a valid co-op year." }),
    })
    .min(2000)
    .max(dayjs().year()),
  overallRating: z.coerce
    .number({
      errorMap: () => ({ message: "Please select a valid rating." }),
    })
    .min(1)
    .max(5),
  cultureRating: z.coerce
    .number({
      errorMap: () => ({ message: "Please select a valid culture rating." }),
    })
    .min(1)
    .max(5),
  supervisorRating: z.coerce
    .number({
      errorMap: () => ({ message: "Please select a valid supervisor rating." }),
    })
    .min(1)
    .max(5),
  interviewRounds: z
    .array(
      z.object({
        interviewType: ZodInterviewTypeSchema,
        interviewDifficulty: ZodInterviewDifficultySchema,
      }),
    )
    .optional()
    .default([]),
  textReview: z
    .string({ required_error: "You need to enter a review." })
    .min(8, { message: "The review must be at least 8 characters." })
    .refine((val) => !filter.isProfane(val), {
      message: "The review cannot contain profane words.",
    }),
  companyName: z
    .string()
    .min(1, { message: "You need to enter a company." })
    .nullable(),
  roleName: z
    .string()
    .min(1, { message: "You need to enter a role." })
    .nullable(),
  locationId: z.string().min(1, { message: "You need to select a location." }),
  jobType: z.nativeEnum(JobType, { message: "You need to select a job type." }),
  hourlyPay: z.coerce
    .number()
    .min(0, { message: "Please enter hourly pay" })
    .transform((val) => (Number.isNaN(val) ? null : val.toString()))
    .nullable(),
  workEnvironment: z.nativeEnum(WorkEnvironment, {
    required_error: "You need to select a work model.",
  }),
  drugTest: z
    .string({
      required_error: "You need to select whether you were drug-tested.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  pto: z
    .string({ required_error: "You need to select whether you received PTO." })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  overtimeNormal: z
    .string({
      required_error: "You need to select whether overtime was common.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  federalHolidays: z
    .string()
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  freeLunch: z.boolean(),
  travelBenefits: z.boolean(),
  freeMerch: z.boolean(),
  snackBar: z.boolean(),
  otherBenefits: z.string().nullable(),
  jobLength: z.coerce.number().int().min(1).nullable().optional(),
  workHours: z.coerce.number().int().min(1).nullable().optional(),
  accessibleByTransportation: z
    .string()
    .transform((x) => x === "true")
    .pipe(z.boolean())
    .optional(),
  teamOutings: z.boolean().optional(),
  coffeeChats: z.boolean().optional(),
  constructiveFeedback: z.boolean().optional(),
  onboarding: z.boolean().optional(),
  workStructure: z.boolean().optional(),
  careerGrowth: z.boolean().optional(),
  toolNames: z.array(z.string()).optional().default([]),
});

type ReviewFormValues = z.infer<typeof formSchema>;

/** Radix DismissableLayer wraps the native event in `detail.originalEvent` (pointerdown / focusin). */
function isOutsideEventOnAutocompletePortal(e: {
  detail?: { originalEvent?: { target?: EventTarget | null } };
}): boolean {
  const target = e.detail?.originalEvent?.target;
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-autocomplete-portal]"))
  );
}

export interface ReviewViewEditModalProps {
  reviewId: string;
  mode: "view" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: "view" | "edit") => void;
}

export function ReviewViewEditModal({
  reviewId,
  mode,
  open,
  onOpenChange,
  onModeChange,
}: ReviewViewEditModalProps) {
  const { toast } = useCustomToast();
  const utils = api.useUtils();

  const [discardKey, setDiscardKey] = useState(0);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);

  const { data: review, isLoading } = api.review.getById.useQuery(
    { id: reviewId },
    { enabled: open && !!reviewId },
  );

  const { data: role } = api.role.getById.useQuery(
    { id: review?.roleId ?? "" },
    { enabled: !!review?.roleId },
  );
  const { data: company } = api.company.getById.useQuery(
    { id: review?.companyId ?? "" },
    { enabled: !!review?.companyId },
  );
  const { data: location } = api.location.getById.useQuery(
    { id: review?.locationId ?? "" },
    { enabled: !!review?.locationId },
  );
  const { data: profile } = api.profile.getCurrentUser.useQuery();
  // For the header's role rating, as on compare cards
  const { data: roleAverages } = api.role.getAverageById.useQuery(
    { roleId: review?.roleId ?? "" },
    { enabled: !!review?.roleId },
  );
  const { data: roleReviews } = api.review.getByRole.useQuery(
    { id: review?.roleId ?? "" },
    { enabled: !!review?.roleId },
  );

  // Read-only until Edit is clicked. Set on the DOM node because
  // React 18 doesn't pass the inert prop through reliably.
  const formFieldsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (formFieldsRef.current) formFieldsRef.current.inert = mode === "view";
  });

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workTerm: undefined,
      workYear: undefined,
      overallRating: 0,
      cultureRating: 1,
      supervisorRating: 1,
      interviewRounds: [],
      textReview: "",
      locationId: "",
      jobType: undefined,
      hourlyPay: "",
      workEnvironment: undefined,
      drugTest: undefined,
      overtimeNormal: undefined,
      pto: undefined,
      federalHolidays: undefined,
      freeLunch: false,
      travelBenefits: false,
      freeMerch: false,
      snackBar: false,
      otherBenefits: "",
      roleName: "",
      companyName: "",
      jobLength: null,
      workHours: null,
      accessibleByTransportation: undefined,
      teamOutings: false,
      coffeeChats: false,
      constructiveFeedback: false,
      onboarding: false,
      workStructure: false,
      careerGrowth: false,
      toolNames: [],
    },
  });

  // Fill the form with the saved review whenever it opens or changes mode;
  // view mode shows the same filled-in form, just not editable
  useEffect(() => {
    if (review && open) {
      const toBoolStr = (v: boolean | null | undefined) =>
        v === true ? "yes" : v === false ? "no" : undefined;

      form.reset({
        workTerm: (review.workTerm as WorkTermType | undefined) ?? undefined,
        workYear: review.workYear ?? undefined,
        overallRating: review.overallRating ?? 0,
        cultureRating: review.cultureRating ?? 1,
        supervisorRating: review.supervisorRating ?? 1,
        interviewRounds: review.interviewRounds.map(
          (r: InterviewRoundType) => ({
            interviewType: r.interviewType ?? undefined,
            interviewDifficulty: r.interviewDifficulty ?? undefined,
          }),
        ),
        textReview: review.textReview ?? "",
        locationId: review.locationId ?? "",
        jobType: (review.jobType as JobTypeType | undefined) ?? undefined,
        hourlyPay: review.hourlyPay ?? "",
        workEnvironment:
          (review.workEnvironment as WorkEnvironmentType | undefined) ??
          undefined,
        drugTest: toBoolStr(review.drugTest) as unknown as boolean,
        pto: toBoolStr(review.pto) as unknown as boolean,
        overtimeNormal: toBoolStr(review.overtimeNormal) as unknown as boolean,
        federalHolidays: (review.federalHolidays === true
          ? "true"
          : review.federalHolidays === false
            ? "false"
            : undefined) as unknown as boolean,
        freeLunch: review.freeLunch ?? false,
        travelBenefits: review.travelBenefits ?? false,
        freeMerch: review.freeMerch ?? false,
        snackBar: review.snackBar ?? false,
        otherBenefits: review.otherBenefits ?? "",
        roleName: review.roleId ?? "",
        companyName: review.companyId ?? "",
        jobLength: review.jobLength ?? null,
        workHours: review.workHours ?? null,
        accessibleByTransportation: (review.accessibleByTransportation === true
          ? "true"
          : review.accessibleByTransportation === false
            ? "false"
            : undefined) as unknown as boolean,
        teamOutings: review.teamOutings ?? false,
        coffeeChats: review.coffeeChats ?? false,
        constructiveFeedback: review.constructiveFeedback ?? false,
        onboarding: review.onboarding ?? false,
        workStructure: review.workStructure ?? false,
        careerGrowth: review.careerGrowth ?? false,
        toolNames:
          (
            review.reviewsToTools as { tool: { name: string } }[] | undefined
          )?.map((rt) => rt.tool.name) ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review, mode, open]);

  const updateMutation = api.review.update.useMutation({
    onSuccess: async () => {
      toast.success("Review updated");
      // Refetch everything: a changed company/role/rating shows up in job
      // cards, search results and company pages, not just this pop-up
      await utils.invalidate();
      onModeChange("view");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const normalizeRadio = (v: unknown): boolean | null =>
    v === true || v === "true" || v === "yes"
      ? true
      : v === false || v === "false" || v === "no"
        ? false
        : null;

  function buildPayload(values: ReviewFormValues, status: StatusType) {
    if (!review || !profile) return null;
    return {
      id: reviewId,
      // Always the form's current picks: falling back to the saved role
      // after the company changed paired a new company with the old role
      roleId: values.roleName ?? "",
      profileId: profile.id,
      companyId: values.companyName ?? "",
      workTerm: values.workTerm,
      workYear: values.workYear,
      overallRating: values.overallRating,
      cultureRating: values.cultureRating,
      supervisorRating: values.supervisorRating,
      interviewRounds: values.interviewRounds,
      textReview: values.textReview,
      locationId: values.locationId,
      jobType: values.jobType,
      hourlyPay:
        values.hourlyPay === "" || values.hourlyPay === null
          ? null
          : values.hourlyPay,
      workEnvironment: values.workEnvironment,
      drugTest: normalizeRadio(values.drugTest),
      pto: normalizeRadio(values.pto),
      overtimeNormal: normalizeRadio(values.overtimeNormal),
      federalHolidays: normalizeRadio(values.federalHolidays),
      freeLunch: values.freeLunch,
      travelBenefits: values.travelBenefits,
      freeMerch: values.freeMerch,
      snackBar: values.snackBar,
      otherBenefits: values.otherBenefits ?? null,
      jobLength: values.jobLength ?? null,
      workHours: values.workHours ?? null,
      accessibleByTransportation: normalizeRadio(
        values.accessibleByTransportation,
      ),
      teamOutings: values.teamOutings ?? null,
      coffeeChats: values.coffeeChats ?? null,
      constructiveFeedback: values.constructiveFeedback ?? null,
      onboarding: values.onboarding ?? null,
      workStructure: values.workStructure ?? null,
      careerGrowth: values.careerGrowth ?? null,
      toolNames: values.toolNames,
      reviewHeadline: review.reviewHeadline ?? "",
      status,
    };
  }

  function onDiscardEdits() {
    if (!review) return;
    const toBoolStr = (v: boolean | null | undefined) =>
      v === true ? "yes" : v === false ? "no" : undefined;
    form.reset({
      workTerm: (review.workTerm as WorkTermType | undefined) ?? undefined,
      workYear: review.workYear ?? undefined,
      overallRating: review.overallRating ?? 0,
      cultureRating: review.cultureRating ?? 0,
      supervisorRating: review.supervisorRating ?? 0,
      interviewRounds: review.interviewRounds.map((r: InterviewRoundType) => ({
        interviewType: r.interviewType ?? undefined,
        interviewDifficulty: r.interviewDifficulty ?? undefined,
      })),
      textReview: review.textReview ?? "",
      locationId: review.locationId ?? "",
      jobType: (review.jobType as JobTypeType | undefined) ?? undefined,
      hourlyPay: review.hourlyPay ?? "",
      workEnvironment:
        (review.workEnvironment as WorkEnvironmentType | undefined) ??
        undefined,
      drugTest: toBoolStr(review.drugTest) as unknown as boolean,
      pto: toBoolStr(review.pto) as unknown as boolean,
      overtimeNormal: toBoolStr(review.overtimeNormal) as unknown as boolean,
      federalHolidays: (review.federalHolidays === true
        ? "true"
        : review.federalHolidays === false
          ? "false"
          : undefined) as unknown as boolean,
      freeLunch: review.freeLunch ?? false,
      travelBenefits: review.travelBenefits ?? false,
      freeMerch: review.freeMerch ?? false,
      snackBar: review.snackBar ?? false,
      otherBenefits: review.otherBenefits ?? "",
      roleName: review.roleId ?? "",
      companyName: review.companyId ?? "",
      jobLength: review.jobLength ?? null,
      workHours: review.workHours ?? null,
      accessibleByTransportation: (review.accessibleByTransportation === true
        ? "true"
        : review.accessibleByTransportation === false
          ? "false"
          : undefined) as unknown as boolean,
      teamOutings: review.teamOutings ?? false,
      coffeeChats: review.coffeeChats ?? false,
      constructiveFeedback: review.constructiveFeedback ?? false,
      onboarding: review.onboarding ?? false,
      workStructure: review.workStructure ?? false,
      careerGrowth: review.careerGrowth ?? false,
      toolNames:
        (
          review.reviewsToTools as { tool: { name: string } }[] | undefined
        )?.map((rt) => rt.tool.name) ?? [],
    });
    setDiscardKey((k) => k + 1);
  }

  async function onSaveEdits() {
    if (!review || !profile) return;
    const { companyName, roleName } = form.getValues();
    if (!companyName || !roleName) {
      toast.error("Please pick a company and role before saving.");
      return;
    }
    const payload = buildPayload(form.getValues(), review.status as StatusType);
    if (!payload) return;
    try {
      await updateMutation.mutateAsync(payload);
    } catch (e) {
      console.error("Save draft failed:", e);
    }
  }

  async function onSubmitReview() {
    if (!review || !profile) return;
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const payload = buildPayload(form.getValues(), Status.PUBLISHED);
    if (!payload) return;
    try {
      await updateMutation.mutateAsync(payload);
    } catch (e) {
      console.error("Submit failed:", e);
    }
  }

  const locationDisplay = prettyLocationName(location);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[74vh] w-[calc(100vw-32px)] md:w-[66vw] max-w-2xl sm:max-w-2xl flex-col gap-0 overflow-hidden rounded-xl border border-cooper-gray-150 bg-white p-0"
        onInteractOutside={(e) => {
          if (isOutsideEventOnAutocompletePortal(e)) {
            e.preventDefault();
          }
        }}
      >
        {/* Header: same layout and padding as a small compare card's */}
        {/* Buttons + X sit top right: in their own row above the title below
            md (col-reverse), beside it from md up */}
        <div className="flex shrink-0 flex-col-reverse gap-4 bg-white px-4 pb-5 pt-3 md:flex-row md:items-start md:justify-between">
          {/* min-w-0 lets a long title wrap instead of pushing the buttons */}
          <div className="min-w-0 flex-1">
            <RoleHeader
              logo={
                <div className={logoBoxClass(true)}>
                  {company && (
                    <Logo
                      company={company}
                      className="h-8 min-h-8 w-8 min-w-8 rounded-md text-lg"
                    />
                  )}
                </div>
              }
              title={role?.title ?? "—"}
              jobTypeLabel={
                review?.jobType === "CO-OP"
                  ? "Co-op"
                  : (review?.jobType ?? null)
              }
              locationLabel={locationDisplay || null}
              rating={
                roleReviews
                  ? {
                      average: Number(roleAverages?.averageOverallRating ?? 0),
                      count: roleReviews.length,
                    }
                  : null
              }
              small
            />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-5 md:pt-0">
            {/* Button styles match the delete review dialog */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {mode === "view" ? (
                <>
                  <DeleteReviewDialog
                    reviewId={reviewId}
                    isDraft={review?.status === "DRAFT"}
                    trigger={
                      <button className="h-9 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-[#F6F6F6]">
                        Delete
                      </button>
                    }
                  />
                  <button
                    onClick={() => onModeChange("edit")}
                    className="h-9 whitespace-nowrap rounded-lg border-none bg-cooper-gray-550 px-3 py-2 text-sm font-semibold text-white hover:bg-cooper-gray-600"
                  >
                    Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDiscardConfirmOpen(true)}
                    disabled={updateMutation.isPending}
                    className="h-9 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-[#F6F6F6] disabled:opacity-50"
                  >
                    Discard edits
                  </button>
                  <button
                    onClick={onSaveEdits}
                    disabled={updateMutation.isPending}
                    // Filled as the main action, unless a draft's Submit is
                    className={cn(
                      "h-9 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50",
                      review?.status === "DRAFT"
                        ? "border border-gray-300 bg-white text-black hover:bg-[#F6F6F6]"
                        : "border-none bg-cooper-gray-550 text-white hover:bg-cooper-gray-600",
                    )}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  {review?.status === "DRAFT" && (
                    <button
                      onClick={onSubmitReview}
                      disabled={updateMutation.isPending}
                      className="h-9 whitespace-nowrap rounded-lg border-none bg-cooper-gray-550 px-3 py-2 text-sm font-semibold text-white hover:bg-cooper-gray-600 disabled:opacity-50"
                    >
                      {updateMutation.isPending
                        ? "Submitting..."
                        : "Submit review"}
                    </button>
                  )}
                </>
              )}
            </div>
            <DialogClose asChild>
              <button className="flex h-4 w-4 shrink-0 items-center justify-center">
                <X className="h-4 w-4 text-cooper-gray-900" />
              </button>
            </DialogClose>
          </div>
        </div>

        <hr className="shrink-0 border-cooper-gray-150" />

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-cooper-gray-400">
            Loading...
          </div>
        ) : (
          <PortalZIndexContext.Provider value={60}>
            <Form {...form}>
              <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-20 pt-5">
                {/* Locked in view mode (inert + no pointer events) on an inner
                    div, so the outer one still scrolls */}
                <ReadOnlyContext.Provider value={mode === "view"}>
                  <div
                    ref={formFieldsRef}
                    className={cn(
                      "flex flex-col gap-8",
                      // Gray field boxes, checkboxes and radios so it reads as
                      // locked until Edit
                      mode === "view" && [
                        "pointer-events-none select-none",
                        "[&_[role=combobox]]:!bg-cooper-gray-100 [&_input]:!bg-cooper-gray-100 [&_textarea]:!bg-cooper-gray-100",
                        "[&_[role=checkbox]]:!border-cooper-gray-150 [&_[role=checkbox]]:!bg-cooper-gray-100",
                        "[&_[role=checkbox][data-state=checked]]:!border-cooper-gray-600 [&_[role=checkbox][data-state=checked]]:!bg-cooper-gray-600",
                        "[&_[role=radio][data-state=checked]]:!border-cooper-gray-350 [&_[role=radio][data-state=checked]]:!bg-cooper-gray-350",
                      ],
                    )}
                  >
                    <FormSectionBlock title="Basic information" divider={false}>
                      <BasicInfoSection
                        key={discardKey}
                        allowNewCompanyOrRole={false}
                      />
                    </FormSectionBlock>
                    <FormSectionBlock title="On the job">
                      <CompanyDetailsSection />
                    </FormSectionBlock>
                    <FormSectionBlock title="Pay">
                      <PaySection />
                    </FormSectionBlock>
                    <FormSectionBlock title="Interview">
                      <InterviewSection />
                    </FormSectionBlock>
                    <FormSectionBlock title="Review and rate">
                      <ReviewSection />
                    </FormSectionBlock>
                  </div>
                </ReadOnlyContext.Provider>
              </div>
            </Form>
          </PortalZIndexContext.Provider>
        )}
      </DialogContent>

      {/* Confirm before throwing away edits; same layout as the delete dialog */}
      <Dialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <DialogContent className="w-full max-w-md bg-white p-5">
          <DialogHeader>
            <DialogTitle>Discard edits?</DialogTitle>
            <DialogDescription className="text-cooper-gray-400">
              Your changes won&apos;t be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 gap-2 sm:justify-end sm:space-x-0">
            <DialogClose asChild>
              <button
                type="button"
                className="h-9 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-[#F6F6F6]"
              >
                Keep editing
              </button>
            </DialogClose>
            <button
              type="button"
              className="h-9 rounded-lg border-none bg-[#f7784e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#e5683f]"
              onClick={() => {
                onDiscardEdits();
                setDiscardConfirmOpen(false);
                onModeChange("view");
              }}
            >
              Discard
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
