"use client";

import { useEffect, useState } from "react";
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
import { useCustomToast } from "@cooper/ui";
import { Dialog, DialogClose, DialogContent } from "@cooper/ui/dialog";
import { Form } from "@cooper/ui/form";

import {
  BasicInfoSection,
  CompanyDetailsSection,
  InterviewSection,
  PaySection,
  ReviewSection,
} from "~/app/_components/form/sections";
import { PortalZIndexContext } from "~/contexts/portal-z-index";
import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";

import { DeleteReviewDialog } from "./delete-review-dialogue";
import { GrayStar, YellowStar } from "./review-card-stars";

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

const WORK_TERM_LABELS: Record<string, string> = {
  SPRING: "Spring",
  SUMMER: "Summer",
  FALL: "Fall",
};

const WORK_ENV_LABELS: Record<string, string> = {
  INPERSON: "In-person",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

const BENEFITS = [
  { field: "federalHolidays", label: "Federal holidays off" },
  { field: "freeLunch", label: "Free lunch" },
  { field: "travelBenefits", label: "Travel benefits" },
  { field: "freeMerch", label: "Free merchandise" },
  { field: "snackBar", label: "Snack bar" },
] as const;

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

function StarRating({
  value,
  max = 5,
}: {
  value: number | null | undefined;
  max?: number;
}) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) =>
        i < (value ?? 0) ? (
          <YellowStar key={i} className="h-5 w-5" />
        ) : (
          <GrayStar key={i} className="h-5 w-5" />
        ),
      )}
    </div>
  );
}

function ViewField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-bold text-cooper-gray-550">{label}</p>
      <div>{children}</div>
    </div>
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

  const [roleId, setRoleId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");

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
  const existingReviewQuery = api.review.getById.useQuery(
    { id: reviewId },
    { enabled: !!reviewId },
  );
  const existingReview = existingReviewQuery.data;
  const viewLocationQuery = api.location.getById.useQuery(
    { id: existingReview?.locationId ?? "" },
    { enabled: !!existingReview?.locationId && mode === "view" },
  );

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      drugTest: undefined as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      overtimeNormal: undefined as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      pto: undefined as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      federalHolidays: undefined as any,
      freeLunch: false,
      travelBenefits: false,
      freeMerch: false,
      snackBar: false,
      otherBenefits: "",
      roleName: "",
      companyName: "",
      jobLength: null,
      workHours: null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      accessibleByTransportation: undefined as any,
      teamOutings: false,
      coffeeChats: false,
      constructiveFeedback: false,
      onboarding: false,
      workStructure: false,
      careerGrowth: false,
      toolNames: [],
    },
  });

  const watchedRoleName = form.watch("roleName");
  const watchedCompanyName = form.watch("companyName");

  useEffect(() => {
    setRoleId(watchedRoleName ?? "");
  }, [watchedRoleName]);

  useEffect(() => {
    setCompanyId(watchedCompanyName ?? "");
  }, [watchedCompanyName]);

  // Pre-populate form when switching to edit mode
  useEffect(() => {
    if (review && mode === "edit") {
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
      setRoleId(review.roleId ?? "");
      setCompanyId(review.companyId ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review, mode]);

  const updateMutation = api.review.update.useMutation({
    onSuccess: async () => {
      toast.success("Review updated successfully.");
      await utils.review.getByProfile.invalidate();
      onOpenChange(false);
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
      roleId: roleId || review.roleId,
      profileId: profile.id,
      companyId: companyId || review.companyId,
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
    onOpenChange(false);
  }

  async function onSaveEdits() {
    if (!review || !profile) return;
    const payload = buildPayload(form.getValues(), review.status as StatusType);
    if (!payload) return;
    try {
      await updateMutation.mutateAsync(payload);
      toast.success("Review saved.");
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
    const payload = buildPayload(
      form.getValues(),
      Status.PUBLISHED as StatusType,
    );
    if (!payload) return;
    try {
      await updateMutation.mutateAsync(payload);
    } catch (e) {
      console.error("Submit failed:", e);
    }
  }

  const locationDisplay = prettyLocationName(location);
  const activeBenefits = BENEFITS.filter((b) => Boolean(review?.[b.field]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[74vh] md:w-[66vw] w-[80vw] max-w-none sm:max-w-none flex-col gap-0 overflow-hidden rounded-xl border border-cooper-gray-150 bg-white p-0"
        onInteractOutside={(e) => {
          if (isOutsideEventOnAutocompletePortal(e)) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <div className="flex md:flex-row flex-col shrink-0 items-center justify-between bg-cooper-gray-700 pb-5 pl-6 pr-6 pt-8">
          <div className="hidden md:block">
            {mode === "view" ? (
              <div className="flex flex-col gap-1">
                <p className="text-xl font-semibold text-cooper-gray-900">
                  {role?.title ?? "—"}
                </p>
                <p className="text-lg text-cooper-gray-400">
                  {[company?.name, locationDisplay]
                    .filter(Boolean)
                    .join("  •  ")}
                </p>
              </div>
            ) : (
              <p className="text-xl font-semibold text-black">Edit Review</p>
            )}
          </div>
          <div className="flex items-center gap-5 md:pt-0">
            <div className="flex items-center gap-2 flex-wrap">
              {mode === "view" ? (
                <>
                  <DeleteReviewDialog
                    reviewId={reviewId}
                    isDraft={review?.status === "DRAFT"}
                    trigger={
                      <button className="whitespace-nowrap rounded-lg border border-cooper-gray-150 bg-white px-4 py-2.5 text-base font-medium text-black">
                        Delete review
                      </button>
                    }
                  />
                  <button
                    onClick={() => onModeChange("edit")}
                    className="whitespace-nowrap rounded-lg bg-[rgba(0,0,0,0.87)] px-4 py-2.5 text-base font-bold text-white"
                  >
                    Edit Review
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onDiscardEdits}
                    disabled={updateMutation.isPending}
                    className="whitespace-nowrap rounded-lg border border-cooper-gray-150 bg-white px-4 py-2.5 text-base font-medium text-black disabled:opacity-50"
                  >
                    Discard edits
                  </button>
                  <button
                    onClick={onSaveEdits}
                    disabled={updateMutation.isPending}
                    className="whitespace-nowrap rounded-lg border border-cooper-gray-150 bg-white px-4 py-2.5 text-base font-medium text-black disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save edits"}
                  </button>
                  {review?.status === "DRAFT" && (
                    <button
                      onClick={onSubmitReview}
                      disabled={updateMutation.isPending}
                      className="whitespace-nowrap rounded-lg bg-[rgba(0,0,0,0.87)] px-4 py-2.5 text-base font-bold text-white disabled:opacity-50"
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
        ) : mode === "view" ? (
          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-4 pt-5">
            {/* Basic information */}
            <p className="text-xl text-cooper-gray-550">Basic information</p>
            <div className="flex flex-col gap-6">
              <ViewField label="Company name">
                {company ? (
                  <div className="flex h-20 items-center rounded-lg border border-[#eaeaea] bg-[#f5f5f5] px-5 py-4">
                    <div className="flex items-center gap-4">
                      <p className="text-xl text-cooper-gray-900">
                        {company.name}
                      </p>
                      {role && (
                        <p className="text-base text-cooper-gray-400">
                          {role.title}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-black">—</p>
                )}
              </ViewField>
              <ViewField label="Role title">
                <p className="text-base text-black">{role?.title ?? "—"}</p>
              </ViewField>
              <ViewField label="Employment type">
                <p className="text-base text-black">{review?.jobType ?? "—"}</p>
              </ViewField>
              <ViewField label="Co-op/internship term">
                <p className="text-base text-black">
                  {review?.workTerm
                    ? (WORK_TERM_LABELS[review.workTerm] ?? review.workTerm)
                    : "—"}
                </p>
              </ViewField>
              <ViewField label="Year">
                <p className="text-base text-black">
                  {review?.workYear ?? "—"}
                </p>
              </ViewField>
              <ViewField label="Location">
                <p className="text-base text-black">
                  {prettyLocationName(viewLocationQuery.data)}
                </p>
              </ViewField>
            </div>

            <hr className="border-cooper-gray-150" />

            {/* On the job */}
            <p className="text-xl text-cooper-gray-550">On the job</p>
            <div className="flex flex-col gap-6">
              <ViewField label="Work model">
                <p className="text-base text-black">
                  {review?.workEnvironment
                    ? (WORK_ENV_LABELS[review.workEnvironment] ??
                      review.workEnvironment)
                    : "—"}
                </p>
              </ViewField>
              <ViewField label="Drug test required">
                <p className="text-base text-black">
                  {review?.drugTest === true
                    ? "Yes"
                    : review?.drugTest === false
                      ? "No"
                      : "—"}
                </p>
              </ViewField>
              <ViewField label="Company culture">
                <StarRating value={review?.cultureRating} />
              </ViewField>
              <ViewField label="Supervisor rating">
                <StarRating value={review?.supervisorRating} />
              </ViewField>
              <ViewField label="Benefits">
                {activeBenefits.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeBenefits.map((b) => (
                      <span
                        key={b.field}
                        className="rounded-lg border border-cooper-gray-150 bg-cooper-gray-100 px-3.5 py-2 text-sm font-medium text-[#767676]"
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-black">—</p>
                )}
              </ViewField>
            </div>

            <hr className="border-cooper-gray-150" />

            {/* Pay */}
            <p className="text-xl text-cooper-gray-550">Pay</p>
            <div className="flex flex-col gap-6">
              <ViewField label="Hourly pay">
                <p className="text-base text-black">
                  {review?.hourlyPay
                    ? `$${Number(review.hourlyPay).toFixed(2)} / hour`
                    : "—"}
                </p>
              </ViewField>
              <ViewField label="Worked overtime">
                <p className="text-base text-black">
                  {review?.overtimeNormal === true
                    ? "Yes"
                    : review?.overtimeNormal === false
                      ? "No"
                      : "—"}
                </p>
              </ViewField>
              <ViewField label="Received PTO">
                <p className="text-base text-black">
                  {review?.pto === true
                    ? "Yes"
                    : review?.pto === false
                      ? "No"
                      : "—"}
                </p>
              </ViewField>
            </div>

            <hr className="border-cooper-gray-150" />

            {/* Interview */}
            <p className="text-xl text-cooper-gray-550">Interview</p>
            {review?.interviewRounds && review.interviewRounds.length > 0 ? (
              <div className="flex flex-col gap-6">
                {review.interviewRounds.map(
                  (round: InterviewRoundType, index: number) => (
                    <div key={round.id} className="flex items-start gap-7">
                      <p className="w-14 shrink-0 text-base font-bold text-cooper-gray-550">
                        Round {index + 1}
                      </p>
                      <div className="flex flex-1 gap-6">
                        <ViewField label="Interview type">
                          <p className="text-base capitalize text-black">
                            {round.interviewType?.replace(/_/g, " ") ?? "—"}
                          </p>
                        </ViewField>
                        <ViewField label="Difficulty">
                          <p className="text-base capitalize text-black">
                            {round.interviewDifficulty ?? "—"}
                          </p>
                        </ViewField>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-base text-cooper-gray-400">
                No interview rounds recorded.
              </p>
            )}

            <hr className="border-cooper-gray-150" />

            {/* Review and rate */}
            <p className="text-xl text-cooper-gray-550">Review and rate</p>
            <div className="flex flex-col gap-6 pb-12">
              <ViewField label="Overall rating">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-normal text-cooper-gray-900">
                    {review?.overallRating?.toFixed(1) ?? "—"}
                  </span>
                  <YellowStar className="h-7 w-7" />
                </div>
              </ViewField>
              <div className="flex flex-col gap-2">
                <p className="text-base font-bold text-cooper-gray-550">
                  Review text
                </p>
                <div className="min-h-20 rounded-lg bg-cooper-gray-100 px-3 py-2">
                  <p className="text-sm text-cooper-gray-900">
                    {review?.textReview ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* EDIT MODE */
          <PortalZIndexContext.Provider value={60}>
            <Form {...form}>
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pb-20 pt-5">
                <p className="text-xl text-cooper-gray-550">
                  Basic information
                </p>
                <BasicInfoSection profileId={profile?.id} />

                <hr className="border-cooper-gray-150" />

                <p className="text-xl text-cooper-gray-550">On the job</p>
                <CompanyDetailsSection />

                <hr className="border-cooper-gray-150" />

                <p className="text-xl text-cooper-gray-550">Pay</p>
                <PaySection />

                <hr className="border-cooper-gray-150" />

                <p className="text-xl text-cooper-gray-550">Interview</p>
                <InterviewSection />

                <hr className="border-cooper-gray-150" />

                <p className="text-xl text-cooper-gray-550">Review and rate</p>
                <ReviewSection />
              </div>
            </Form>
          </PortalZIndexContext.Provider>
        )}
      </DialogContent>
    </Dialog>
  );
}
