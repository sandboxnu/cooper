"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";

import {
  BasicInfoSection,
  CompanyDetailsSection,
  InterviewSection,
  ReviewSection,
} from "~/app/_components/form/sections";
import { z } from "zod";
import { useCustomToast } from "@cooper/ui";
import { WorkEnvironment, WorkTerm } from "@cooper/db/schema";
import { Filter } from "bad-words";
import dayjs from "dayjs";
import { Form } from "node_modules/@cooper/ui/src/form";
import { PaySection } from "~/app/_components/form/sections/pay-section";
import { SubmissionConfirmation } from "~/app/_components/form/submission-confirmation";
import { SubmissionFailure } from "~/app/_components/form/submission-failure";
import { JobType } from "node_modules/@cooper/db/src/schema/misc";
import { industryOptions } from "~/app/_components/onboarding/constants";

const sectionFields = {
  basic: ["workTerm", "workYear", "companyName", "roleName"] as const,
  company: ["workEnvironment", "drugTest", "overtimeNormal"] as const,
  role: ["industry", "locationId", "hourlyPay"] as const,
  interview: ["field"] as const,
  review: [
    "reviewHeadline",
    "textReview",
    "supervisorRating",
    "overallRating",
    "cultureRating",
    "interviewRating",
  ] as const,
};

type SectionKey = keyof typeof sectionFields;

const hasValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "number" && value === 0) return false;
  return true;
};
const filter = new Filter();

export const benefits = [
  { value: "federalHolidays", label: "Federal holidays off" },
  { value: "freeTransport", label: "Free transportation" },
  { value: "sickLeave", label: "Sick leave" },
  { value: "paidLeave", label: "Paid leave" },
  { value: "mentorshipProgram", label: "Mentorship program" },
  { value: "overtimePay", label: "Overtime pay" },
  { value: "pto", label: "Paid time off (PTO)" },
  { value: "teamSocials", label: "Team socials" },
  { value: "lunchProvided", label: "Lunch provided" },
  { value: "companySwag", label: "Company swag" },
];

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
  interviewRating: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid interview experience rating.",
      }),
    })
    .min(1)
    .max(5),
  interviewDifficulty: z.coerce.number().optional().nullable().default(0),
  interviewReview: z
    .string()
    .optional()
    .refine((val) => !filter.isProfane(val ?? ""), {
      message: "The interview review cannot contain profane words.",
    }),
  reviewHeadline: z
    .string({
      required_error: "You need to enter a Review Headline.",
    })
    .min(8, {
      message: "The review headline must be at least 8 characters.",
    })
    .refine((val) => !filter.isProfane(val), {
      message: "The review headline cannot contain profane words.",
    }),
  companyName: z.string({
    required_error: "You need to enter a company.",
  }),
  roleName: z.string({
    required_error: "You need to enter a role.",
  }),
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
  locationId: z.string().optional(),
  hourlyPay: z.coerce
    .number()
    .min(0, {
      message: "Please enter hourly pay",
    })
    .transform((val) => (val ? val.toString() : null))
    .nullable()
    .optional(),
  workEnvironment: z.nativeEnum(WorkEnvironment, {
    required_error: "You need to select a work model.",
  }),
  jobType: z.nativeEnum(JobType, {
    required_error: "You need to select a job type.",
  }),
  industry: z.enum(
    industryOptions.map((opt) => opt.value) as [string, ...string[]],
    {
      required_error: "You need to select an industry.",
    },
  ),
  drugTest: z
    .string({
      required_error: "You need to select whether you were drug-tested.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  overtimeNormal: z
    .string({
      required_error: "You need to select whether working overtime was common.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  pto: z.boolean().default(false),
  federalHolidays: z.boolean().default(false),
  freeLunch: z.boolean().default(false),
  freeTransport: z.boolean().default(false),
  freeMerch: z.boolean().default(false),
  otherBenefits: z.string().nullable(),
});

export type ReviewFormType = typeof formSchema;
export default function ReviewForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = api.auth.getSession.useQuery();
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = api.profile.getCurrentUser.useQuery();

  const [validForm, setValidForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useCustomToast();
  const [roleId, setRoleId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");

  const getSectionStatus = (
    form: ReturnType<typeof useForm<z.infer<ReviewFormType>>>,
    section: SectionKey,
  ): "complete" | "in-progress" | "not-started" => {
    const fields = sectionFields[section];
    const values = form.watch(fields as any);

    const filledCount = fields.filter((field) => {
      const value = form.getValues(field as any);
      return hasValue(value);
    }).length;

    if (filledCount === 0 && fields.length > 0) return "not-started";
    if (filledCount === fields.length) return "complete";
    return "in-progress";
  };

  const form = useForm<z.infer<ReviewFormType>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workTerm: undefined,
      workYear: undefined,
      overallRating: 0,
      cultureRating: 0,
      supervisorRating: 0,
      interviewRating: 0,
      interviewDifficulty: 0,
      interviewReview: "",
      reviewHeadline: "",
      textReview: "",
      locationId: "",
      hourlyPay: "",
      workEnvironment: undefined,
      drugTest: undefined,
      overtimeNormal: undefined,
      pto: false,
      federalHolidays: false,
      freeLunch: false,
      freeTransport: false,
      freeMerch: false,
      otherBenefits: "",
    },
  });

  const steps = [
    { id: 1, title: "01. Basic Information", section: "basic" as SectionKey },
    {
      id: 2,
      title: "02. Company Information",
      section: "company" as SectionKey,
    },
    { id: 3, title: "03. Role Information", section: "role" as SectionKey },
    { id: 4, title: "04. Interview", section: "interview" as SectionKey },
    { id: 5, title: "05. Final co-op review", section: "review" as SectionKey },
  ];

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
        String(review.workTerm) === currentTerm &&
        review.workYear === Number(currentYear),
    );

    return reviewsForCurrentTerm.length < 2;
  };

  const mutation = api.review.create.useMutation({
    onSuccess: () => {
      setValidForm(true);
      setSubmitted(true);
    },
    onError: (error) => {
      setValidForm(false);
      setErrorMessage(error.message || "An unknown error occurred.");

      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  async function onSubmit(values: z.infer<ReviewFormType>) {
    try {
      await mutation.mutateAsync({
        roleId: roleId,
        profileId: profile?.id,
        companyId: companyId,
        ...values,
        interviewDifficulty: values.interviewDifficulty ?? 0,
      });
    } catch (error) {
      // Error is already handled by onError callback
      console.error("Mutation failed:", error);
    }
  }

  if (!sessionLoading && !profileLoading && (!session || !profile)) {
    redirect("/");
  }

  if (!session || !profile) {
    return null;
  }

  if (submitted) {
    if (validForm) {
      return <SubmissionConfirmation />;
    } else {
      return <SubmissionFailure message={errorMessage ?? undefined} />;
    }
  }

  return (
    <Form {...form}>
      <div className="bg-white w-full min-h-screen flex flex-col md:flex-row justify-center items-center">
        <div className="mt-4 pr-3.5 flex h-full pt-10 flex-col justify-left w-[65%]">
          <div className="text-lg text-[#333]">Basic information</div>
          <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap w-full">
            <BasicInfoSection />
          </div>
          <hr />
          {canReviewForTerm() ? (
            <div>
              <div className="text-lg text-[#333]">On the job</div>
              <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap ">
                <CompanyDetailsSection />
              </div>
              <hr />
              <div className="text-lg text-[#333]">Pay</div>
              <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                <PaySection />
              </div>
              <hr />
              <div className="text-lg text-[#333]">Interview</div>
              <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                <div className="flex flex-wrap gap-10 lg:flex-nowrap">
                  <InterviewSection />
                </div>
              </div>
              <hr />
              <div className="text-lg text-[#333]">Review and rate</div>
              <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap pb-10">
                <ReviewSection />
              </div>
            </div>
          ) : (
            <div>You already submitted too many reviews for this term</div>
          )}
        </div>
      </div>
    </Form>
  );
}
