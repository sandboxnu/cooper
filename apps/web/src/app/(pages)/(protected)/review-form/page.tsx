"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  JobType,
  Status,
  UserRole,
  WorkEnvironment,
  WorkTerm,
  ZodInterviewDifficultySchema,
  ZodInterviewTypeSchema,
} from "@cooper/db/schema";
import type {
  JobTypeType,
  StatusType,
  WorkEnvironmentType,
  WorkTermType,
} from "@cooper/db/schema";
import { useCustomToast } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { Form } from "@cooper/ui/form";

import {
  BasicInfoSection,
  CompanyDetailsSection,
  InterviewSection,
  ReviewSection,
} from "~/app/_components/form/sections";
import Popup from "~/app/_components/form/sections/popup";
import { PaySection } from "~/app/_components/form/sections/pay-section";
import { DeleteReviewDialog } from "~/app/_components/reviews/delete-review-dialogue";
import { api } from "~/trpc/react";
import { prettyLocationName } from "~/utils/locationHelpers";
import { prettyWorkEnviornment } from "~/utils/stringHelpers";

const filter = new Filter();

// test msg
const formSchema = z.object({
  workTerm: z.nativeEnum(WorkTerm, {
    required_error: "You need to select a co-op cycle.",
  }),
  workYear: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid co-op year.",
      }),
    })
    .min(2000)
    .max(dayjs().year()),
  overallRating: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid co-op experience rating.",
      }),
    })
    .min(1)
    .max(5),
  cultureRating: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid company culture rating.",
      }),
    })
    .min(1)
    .max(5),
  supervisorRating: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid supervisor rating.",
      }),
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
    .string({
      required_error: "You need to enter a review for your co-op.",
    })
    .min(8, {
      message: "The review must be at least 8 characters.",
    })
    .refine((val) => !filter.isProfane(val), {
      message: "The review cannot contain profane words.",
    }),
  companyName: z
    .string({
      required_error: "You need to enter a company.",
    })
    .min(1, {
      message: "You need to enter a company.",
    })
    .nullable(),
  roleName: z
    .string({
      required_error: "You need to enter a company.",
    })
    .min(1, {
      message: "You need to enter a company.",
    })
    .nullable(),
  locationId: z.string().min(1, {
    message: "You need to select a location.",
  }),
  jobType: z.nativeEnum(JobType, {
    message: "You need to select a job type.",
  }),
  hourlyPay: z.coerce
    .number()
    .min(0, {
      message: "Please enter hourly pay",
    })
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
    .string({
      required_error: "You need to select whether you received PTO.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  overtimeNormal: z
    .string({
      required_error: "You need to select whether working overtime was common.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  federalHolidays: z.boolean(),
  freeLunch: z.boolean(),
  travelBenefits: z.boolean(),
  freeMerch: z.boolean(),
  snackBar: z.boolean(),
  otherBenefits: z.string().nullable(),
});

export type ReviewFormType = typeof formSchema;
export default function ReviewForm() {
  const router = useRouter();
  const utils = api.useUtils();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode"); // "view" | "edit" | null
  const reviewId = searchParams.get("reviewId");

  const {
    data: session,
    isLoading: sessionLoading,
    error: _sessionError,
  } = api.auth.getSession.useQuery();
  const {
    data: profile,
    isLoading: profileLoading,
    error: _profileError,
  } = api.profile.getCurrentUser.useQuery();

  // Load existing review for view/edit mode
  const existingReviewQuery = api.review.getById.useQuery(
    { id: reviewId ?? "" },
    { enabled: !!reviewId },
  );
  const existingReview = existingReviewQuery.data;

  // Load related data for view mode
  const viewRoleQuery = api.role.getById.useQuery(
    { id: existingReview?.roleId ?? "" },
    { enabled: !!existingReview?.roleId && mode === "view" },
  );
  const viewCompanyQuery = api.company.getById.useQuery(
    { id: existingReview?.companyId ?? "" },
    { enabled: !!existingReview?.companyId && mode === "view" },
  );
  const viewLocationQuery = api.location.getById.useQuery(
    { id: existingReview?.locationId ?? "" },
    { enabled: !!existingReview?.locationId && mode === "view" },
  );

  const { toast } = useCustomToast();
  const [roleId, setRoleId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [formPopulated, setFormPopulated] = useState(false);

  const form = useForm<z.infer<ReviewFormType>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workTerm: undefined,
      workYear: undefined,
      overallRating: 0,
      cultureRating: 0,
      supervisorRating: 0,
      interviewRounds: [
        { interviewType: undefined, interviewDifficulty: undefined },
        { interviewType: undefined, interviewDifficulty: undefined },
      ],
      textReview: "",
      locationId: "",
      jobType: undefined,
      hourlyPay: "",
      workEnvironment: undefined,
      drugTest: undefined,
      overtimeNormal: undefined,
      pto: undefined,
      federalHolidays: false,
      freeLunch: false,
      travelBenefits: false,
      freeMerch: false,
      snackBar: false,
      otherBenefits: "",
      roleName: "",
      companyName: "",
    },
  });
  // Watch form values and update roleId and companyId
  const roleName = form.watch("roleName");
  const companyName = form.watch("companyName");

  const isDirty = form.formState.isDirty;
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    form.reset();
    setShowModal(false);
    isDirtyRef.current = false;
  }, [form]);

  useEffect(() => {
    if (roleName) {
      setRoleId(roleName);
    } else {
      setRoleId("");
    }
  }, [roleName]);

  useEffect(() => {
    if (companyName) {
      setCompanyId(companyName);
    } else {
      setCompanyId("");
    }
  }, [companyName]);

  useEffect(() => {
    const handleLeave: EventListener = () => {
      if (isDirtyRef.current) {
        setShowModal(true);
      } else {
        router.push("/roles");
      }
    };
    window.addEventListener("review-form:leave-attempt", handleLeave);

    return () => {
      window.removeEventListener("review-form:leave-attempt", handleLeave);
    };
  }, [router]);

  const profileId = profile?.id;

  const reviews = api.review.getByProfile.useQuery(
    { id: profileId ?? "" },
    {
      enabled: !!profileId,
    },
  );

  const canReviewForTerm = (): boolean => {
    if (!reviews.data) return true;

    const currentTerm = form.getValues("workTerm");
    const currentYear = form.getValues("workYear");

    const reviewsForCurrentTerm = reviews.data.filter(
      (review) =>
        review.status === Status.PUBLISHED &&
        String(review.workTerm) === currentTerm &&
        review.workYear === Number(currentYear),
    );

    return reviewsForCurrentTerm.length < 2;
  };

  const mutation = api.review.create.useMutation({
    onSuccess: () => {
      router.push("/roles");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  const draftMutation = api.review.saveDraft.useMutation({
    onSuccess: async () => {
      if (profileId) {
        await utils.review.getByProfile.invalidate({ id: profileId });
      }
      router.push("/roles");
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save draft. Please try again.");
    },
  });

  const updateMutation = api.review.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        profileId
          ? utils.review.getByProfile.invalidate({ id: profileId })
          : Promise.resolve(),
        reviewId
          ? utils.review.getById.invalidate({ id: reviewId })
          : Promise.resolve(),
      ]);
      toast.success("Review updated successfully.");
      router.push("/profile?tab=reviews");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to update review. Please try again.",
      );
    },
  });

  async function onSubmit(values: z.infer<ReviewFormType>) {
    try {
      await mutation.mutateAsync({
        roleId: roleId,
        profileId: profile?.id,
        companyId: companyId,
        ...values,
        reviewHeadline: "",
        status: Status.PUBLISHED,
      });
    } catch (error) {
      // Error is already handled by onError callback
      console.error("Mutation failed:", error);
    }
  }

  const normalizeRadios = (v: unknown): boolean | null =>
    v === true || v === "true" || v === "yes"
      ? true
      : v === false || v === "false" || v === "no"
        ? false
        : null;

  async function onUpdateReview(status: StatusType = Status.PUBLISHED) {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      const values = form.getValues();
      await updateMutation.mutateAsync({
        id: reviewId ?? "",
        roleId: roleId || existingReview?.roleId,
        profileId: profile?.id,
        companyId: companyId || existingReview?.companyId,
        ...values,
        drugTest: normalizeRadios(values.drugTest),
        pto: normalizeRadios(values.pto),
        overtimeNormal: normalizeRadios(values.overtimeNormal),
        reviewHeadline: "",
        status,
      } as Parameters<typeof updateMutation.mutateAsync>[0]);
    } catch (error) {
      console.error("Update failed:", error);
    }
  }

  async function onSaveEdits() {
    try {
      const values = form.getValues();
      const draftPayload = {
        id: reviewId ?? "",
        roleId: roleId || existingReview?.roleId,
        profileId: profileId,
        companyId: companyId || existingReview?.companyId,
        workTerm: values.workTerm,
        workYear: values.workYear,
        overallRating: values.overallRating,
        cultureRating: values.cultureRating,
        supervisorRating: values.supervisorRating,
        interviewRounds: values.interviewRounds,
        reviewHeadline: "",
        textReview: values.textReview || null,
        locationId: values.locationId || null,
        jobType: values.jobType,
        hourlyPay: values.hourlyPay === "" ? null : values.hourlyPay,
        workEnvironment: values.workEnvironment,
        drugTest: values.drugTest,
        pto: values.pto,
        overtimeNormal: values.overtimeNormal,
        federalHolidays: values.federalHolidays || null,
        freeLunch: values.freeLunch || null,
        travelBenefits: values.travelBenefits || null,
        freeMerch: values.freeMerch || null,
        snackBar: values.snackBar || null,
        otherBenefits: values.otherBenefits ?? null,
        status: Status.DRAFT,
      };
      await updateMutation.mutateAsync(
        draftPayload as Parameters<typeof updateMutation.mutateAsync>[0],
      );
    } catch (error) {
      console.error("Save edits failed:", error);
    }
  }

  // Pre-populate form in edit mode
  useEffect(() => {
    if (existingReview && mode === "edit" && !formPopulated) {
      form.reset({
        workTerm: existingReview.workTerm as WorkTermType,
        workYear: existingReview.workYear ?? undefined,
        overallRating: existingReview.overallRating ?? 0,
        cultureRating: existingReview.cultureRating ?? 0,
        supervisorRating: existingReview.supervisorRating ?? 0,
        textReview: existingReview.textReview ?? "",
        locationId: existingReview.locationId ?? "",
        jobType: existingReview.jobType as JobTypeType,
        hourlyPay: existingReview.hourlyPay ?? "",
        workEnvironment: existingReview.workEnvironment as WorkEnvironmentType,
        drugTest:
          existingReview.drugTest != null
            ? ((existingReview.drugTest ? "yes" : "no") as unknown as boolean)
            : undefined,
        pto:
          existingReview.pto != null
            ? ((existingReview.pto ? "yes" : "no") as unknown as boolean)
            : undefined,
        overtimeNormal:
          existingReview.overtimeNormal != null
            ? ((existingReview.overtimeNormal
                ? "yes"
                : "no") as unknown as boolean)
            : undefined,
        federalHolidays: existingReview.federalHolidays ?? false,
        freeLunch: existingReview.freeLunch ?? false,
        travelBenefits: existingReview.travelBenefits ?? false,
        freeMerch: existingReview.freeMerch ?? false,
        snackBar: existingReview.snackBar ?? false,
        otherBenefits: existingReview.otherBenefits ?? "",
        roleName: existingReview.roleId ?? "",
        companyName: existingReview.companyId ?? "",
        interviewRounds: existingReview.interviewRounds.flatMap((r) =>
          r.interviewType && r.interviewDifficulty
            ? [
                {
                  interviewType: r.interviewType,
                  interviewDifficulty: r.interviewDifficulty,
                },
              ]
            : [],
        ),
      });
      setFormPopulated(true);
    }
  }, [existingReview, mode, formPopulated, form]);

  if (!sessionLoading && !profileLoading && (!session || !profile)) {
    router.push("/roles");
  }

  if (!session || !profile) {
    return null;
  }

  // View mode — show read-only display
  if (mode === "view" && reviewId) {
    if (existingReviewQuery.isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-cooper-gray-400">Loading...</div>
        </div>
      );
    }
    if (!existingReview) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-cooper-gray-400">Review not found.</div>
        </div>
      );
    }

    const isDraft = existingReview.status === "DRAFT";
    const benefits = [
      existingReview.freeLunch && "Free lunch",
      existingReview.snackBar && "Snack bar",
      existingReview.freeMerch && "Free merch",
      existingReview.travelBenefits && "Travel benefits",
      existingReview.federalHolidays && "Federal holidays",
    ].filter(Boolean) as string[];

    const ViewField = ({
      label,
      value,
    }: {
      label: string;
      value: React.ReactNode;
    }) => (
      <div className="flex flex-col gap-1">
        <span className="text-[16px] font-bold text-[#333]">{label}</span>
        {value != null && value !== "" ? (
          <span className="text-[16px] text-black">{value}</span>
        ) : (
          <span className="text-[16px] italic text-[#767676]">
            Not provided
          </span>
        )}
      </div>
    );

    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b px-10 pb-5 pt-8">
          <div className="flex flex-1 flex-col gap-4">
            <h1 className="font-hanken text-[20px] font-semibold">
              {isDraft ? "Draft for" : "Review for"}
            </h1>
            {(viewRoleQuery.data ?? viewCompanyQuery.data) && (
              <div className="flex h-[82px] items-center gap-4 rounded-lg border border-[#eaeaea] bg-[#f5f5f5] px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-[20px] text-[#151515]">
                    {viewRoleQuery.data?.title ?? ""}
                  </span>
                  <span className="text-[16px] text-[#5a5a5a]">
                    {[
                      viewCompanyQuery.data?.name,
                      prettyLocationName(viewLocationQuery.data),
                    ]
                      .filter(Boolean)
                      .join("  •  ")}
                  </span>
                </div>
              </div>
            )}
          </div>
          <button
            className="ml-6 shrink-0 text-[18px] text-[#767676] hover:text-black"
            onClick={() => router.push("/profile?tab=reviews")}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-6 overflow-y-auto px-10 py-8">
          {/* Basic information */}
          <div className="text-[20px] text-[#333]">Basic information</div>
          <div className="flex flex-col gap-6">
            <ViewField
              label="Company name"
              value={viewCompanyQuery.data?.name}
            />
            <ViewField label="Role title" value={viewRoleQuery.data?.title} />
            <ViewField
              label="Employment type"
              value={
                existingReview.jobType === "CO-OP"
                  ? "Co-op"
                  : existingReview.jobType
              }
            />
            <ViewField
              label="Co-op/internship term"
              value={
                existingReview.workTerm
                  ? existingReview.workTerm.charAt(0) +
                    existingReview.workTerm.slice(1).toLowerCase()
                  : null
              }
            />
            <ViewField label="Year" value={existingReview.workYear} />
            <ViewField
              label="Location"
              value={prettyLocationName(viewLocationQuery.data)}
            />
          </div>
          <hr />

          {/* On the job */}
          <div className="text-[20px] text-[#333]">On the job</div>
          <div className="flex flex-col gap-6">
            <ViewField
              label="Work model"
              value={
                existingReview.workEnvironment
                  ? prettyWorkEnviornment(
                      existingReview.workEnvironment as Parameters<
                        typeof prettyWorkEnviornment
                      >[0],
                    )
                  : null
              }
            />
            <ViewField
              label="Drug test required"
              value={
                existingReview.drugTest != null
                  ? existingReview.drugTest
                    ? "Yes"
                    : "No"
                  : null
              }
            />
            <ViewField
              label="Company culture"
              value={
                existingReview.cultureRating
                  ? `${existingReview.cultureRating}/5`
                  : null
              }
            />
            <ViewField
              label="Supervisor rating"
              value={
                existingReview.supervisorRating
                  ? `${existingReview.supervisorRating}/5`
                  : null
              }
            />
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-bold text-[#333]">
                Benefits
              </span>
              {benefits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {benefits.map((b) => (
                    <span
                      key={b}
                      className="rounded-lg border border-[#e7e7e7] bg-[#f7f7f7] px-3.5 py-2 text-[14px] font-medium text-[#767676]"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[16px] italic text-[#767676]">
                  Not provided
                </span>
              )}
            </div>
          </div>
          <hr />

          {/* Pay */}
          <div className="text-[20px] text-[#333]">Pay</div>
          <div className="flex flex-col gap-6">
            <ViewField
              label="Hourly pay"
              value={
                existingReview.hourlyPay
                  ? `$${existingReview.hourlyPay} / hour`
                  : null
              }
            />
            <ViewField
              label="Worked overtime"
              value={
                existingReview.overtimeNormal != null
                  ? existingReview.overtimeNormal
                    ? "Yes"
                    : "No"
                  : null
              }
            />
            <ViewField
              label="Received PTO"
              value={
                existingReview.pto != null
                  ? existingReview.pto
                    ? "Yes"
                    : "No"
                  : null
              }
            />
          </div>
          <hr />

          {/* Interview */}
          <div className="text-[20px] text-[#333]">Interview</div>
          <div className="flex flex-col gap-6">
            {existingReview.interviewRounds.length > 0 ? (
              existingReview.interviewRounds.map((round, i) => (
                <div key={round.id} className="flex flex-col gap-1">
                  <span className="text-[16px] font-bold text-[#333]">
                    Round {i + 1}
                  </span>
                  <span className="text-[16px] text-black">
                    {round.interviewType?.replace(/_/g, " ")} —{" "}
                    {round.interviewDifficulty}
                  </span>
                </div>
              ))
            ) : (
              <ViewField label="Interview rounds" value={null} />
            )}
          </div>
          <hr />

          {/* Review and rate */}
          <div className="text-[20px] text-[#333]">Review and rate</div>
          <div className="flex flex-col gap-6 pb-8">
            <ViewField
              label="Overall rating"
              value={
                existingReview.overallRating
                  ? `${existingReview.overallRating}/5`
                  : null
              }
            />
            <div className="flex flex-col gap-2">
              <span className="text-[16px] font-bold text-[#333]">
                Review text
              </span>
              {existingReview.textReview ? (
                <div className="min-h-[80px] rounded-lg bg-[#f7f7f7] px-3 py-2 text-[14px] text-[#151515]">
                  {existingReview.textReview}
                </div>
              ) : (
                <div className="min-h-[80px] rounded-lg bg-[#f7f7f7] px-3 py-2 text-[14px] italic text-[#767676]">
                  No review text provided yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t bg-[#f4f4f4] px-6 py-5 flex justify-end">
          <Button
            type="button"
            onClick={() =>
              router.push(`/review-form?mode=edit&reviewId=${reviewId}`)
            }
            className="bg-[rgba(0,0,0,0.87)] px-4 py-2.5 text-[16px] font-bold text-white hover:bg-black"
          >
            {isDraft ? "Edit Draft" : "Edit Review"}
          </Button>
        </div>
      </div>
    );
  }

  const discardDraft = () => {
    router.push("/roles");
  };

  async function onSaveDraft() {
    try {
      const values = form.getValues();

      const draftPayload: Record<string, unknown> = {
        roleId: roleId,
        profileId: profileId,
        companyId: companyId,
        workTerm: values.workTerm,
        workYear: values.workYear,
        overallRating: values.overallRating,
        cultureRating: values.cultureRating,
        supervisorRating: values.supervisorRating,
        interviewRounds: values.interviewRounds,
        reviewHeadline: "",
        textReview: values.textReview || null,
        locationId: values.locationId || null,
        jobType: values.jobType,
        hourlyPay: values.hourlyPay === "" ? null : values.hourlyPay,
        workEnvironment: values.workEnvironment,
        drugTest: values.drugTest,
        pto: values.pto,
        overtimeNormal: values.overtimeNormal,
        federalHolidays: values.federalHolidays || null,
        freeLunch: values.freeLunch || null,
        travelBenefits: values.travelBenefits || null,
        freeMerch: values.freeMerch || null,
        snackBar: values.snackBar || null,
        otherBenefits: values.otherBenefits ?? null,
        status: Status.DRAFT,
      };

      await draftMutation.mutateAsync(
        draftPayload as Parameters<typeof draftMutation.mutateAsync>[0],
      );

      form.reset(values);
      isDirtyRef.current = false;
      toast.success("This draft has been saved.");
    } catch (error) {
      console.error("Draft save failed:", error);
    }
  }
  if (
    session.user.role &&
    session.user.role !== UserRole.STUDENT &&
    session.user.role !== UserRole.DEVELOPER
  ) {
    router.replace("/404");
  }

  const isEditMode = mode === "edit" && !!reviewId;
  const editingDraft = existingReview?.status === "DRAFT";

  return (
    <Form {...form}>
      <div
        className={`${showModal ? "pointer-events-none" : ""} flex h-screen w-full flex-col items-center justify-center overflow-auto bg-white md:flex-row`}
      >
        <div className="justify-left mt-4 flex h-full w-[65%] flex-col pr-3.5 pt-10">
          {/* Edit mode header */}
          {isEditMode && (
            <div className="mb-6 flex shrink-0 items-center justify-between rounded-lg bg-[#f4f4f4] px-6 py-5">
              <span className="text-[20px] font-semibold">
                {editingDraft ? "Edit Draft" : "Edit Review"}
              </span>
              <div className="flex items-center gap-2">
                {!editingDraft && existingReview && (
                  <DeleteReviewDialog
                    reviewId={existingReview.id}
                    trigger={
                      <Button
                        type="button"
                        className="border border-[#e7e7e7] bg-white px-4 py-2.5 text-[16px] font-medium text-black hover:bg-gray-50"
                      >
                        Delete review
                      </Button>
                    }
                  />
                )}
                {editingDraft && (
                  <Button
                    type="button"
                    onClick={onSaveEdits}
                    disabled={updateMutation.isPending}
                    className="border border-[#e7e7e7] bg-white px-4 py-2.5 text-[16px] font-medium text-black hover:bg-gray-50"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save edits"}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() =>
                    onUpdateReview(
                      editingDraft ? Status.PUBLISHED : Status.PUBLISHED,
                    )
                  }
                  disabled={updateMutation.isPending}
                  className="bg-[rgba(0,0,0,0.87)] px-4 py-2.5 text-[16px] font-bold text-white hover:bg-black"
                >
                  {updateMutation.isPending
                    ? "Saving..."
                    : editingDraft
                      ? "Submit Review"
                      : "Update Review"}
                </Button>
                <button
                  type="button"
                  className="ml-2 text-[18px] text-[#767676] hover:text-black"
                  onClick={() => router.push("/profile?tab=reviews")}
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="text-cooper-gray-550 text-lg">Basic information</div>
          <div className="flex w-full flex-wrap gap-10 pb-12 xl:flex-nowrap">
            <BasicInfoSection profileId={profileId} />
          </div>
          <hr />
          {canReviewForTerm() || isEditMode ? (
            <div>
              <div className="text-cooper-gray-550 pt-12 text-lg">
                On the job
              </div>
              <div className="flex flex-wrap gap-10 pb-12 xl:flex-nowrap">
                <CompanyDetailsSection />
              </div>
              <hr />
              <div className="text-cooper-gray-550 pt-12 text-lg">Pay</div>
              <div className="flex flex-wrap gap-10 overflow-auto pb-12 xl:flex-nowrap">
                <PaySection />
              </div>
              <hr />
              <div className="text-cooper-gray-550 pt-12 text-lg">
                Interview
              </div>
              <div className="flex flex-wrap gap-10 pb-12 lg:flex-nowrap">
                <InterviewSection />
              </div>
              <hr />
              <div className="text-cooper-gray-550 pt-12 text-lg">
                Review and rate
              </div>
              <div className="flex flex-wrap gap-10 overflow-auto pb-10 xl:flex-nowrap">
                <ReviewSection />
              </div>
              {!isEditMode && (
                <div className="flex gap-2 justify-end">
                  {/* Save Draft Button */}
                  <div className="pb-12 pt-6">
                    <Button
                      type="button"
                      onClick={onSaveDraft}
                      disabled={mutation.isPending || draftMutation.isPending}
                      className="bg-white hover:bg-cooper-gray-600
                    rounded-lg border border-cooper-gray-150 2-253 px-8 py-3 text-lg font-semibold
                    text-[#151515]"
                    >
                      {draftMutation.isPending
                        ? "Saving draft..."
                        : "Save draft"}
                    </Button>
                  </div>
                  {/* Submit Button */}
                  <div className="pb-12 pt-6">
                    <Button
                      type="button"
                      onClick={async () => {
                        const isValid = await form.trigger();
                        if (!isValid) {
                          toast.error("Please fill in all required fields.");
                          return;
                        }
                        await form.handleSubmit(onSubmit)();
                      }}
                      disabled={mutation.isPending || draftMutation.isPending}
                      className="bg-cooper-gray-550 hover:bg-cooper-gray-600 rounded-lg border-none px-8 py-3 text-lg font-semibold text-white"
                    >
                      {mutation.isPending ? "Submitting..." : "Submit review"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>You already submitted too many reviews for this term</div>
          )}
        </div>
        {isDirty && showModal && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <div className="pointer-events-auto">
              <Popup
                showModal={showModal}
                onCancel={() => setShowModal(false)}
                onDiscard={discardDraft}
                onSave={onSaveDraft}
              />
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
