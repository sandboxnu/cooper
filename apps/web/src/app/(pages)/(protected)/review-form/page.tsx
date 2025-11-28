"use client";

import { useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";

import { Button } from "@cooper/ui/button";
import FormCollapsableInfoCard from "~/app/_components/form/form-collapsable-info";
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
import { RoleInfoSection } from "~/app/_components/form/sections/role-info-section";
import { Circle } from "lucide-react";
import { SubmissionConfirmation } from "~/app/_components/form/submission-confirmation";
import { SubmissionFailure } from "~/app/_components/form/submission-failure";

const sectionFields = {
  basic: ["workTerm", "workYear"] as const,
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
  { field: "federalHolidays", label: "Federal holidays off" },
  { field: "freeTransport", label: "Free transportation" },
  { field: "sickLeave", label: "Sick leave" },
  { field: "paidLeave", label: "Paid leave" },
  { field: "mentorshipProgram", label: "Mentorship program" },
  { field: "overtimePay", label: "Overtime pay" },
  { field: "pto", label: "Paid time off (PTO)" },
  { field: "teamSocials", label: "Team socials" },
  { field: "lunchProvided", label: "Lunch provided" },
  { field: "companySwag", label: "Company swag" },
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
      <div className="bg-[#F2F1EA] w-full min-h-screen flex flex-col md:flex-row justify-center">
        <div className="pl-7 pt-4 flex h-full flex-row md:flex-col md:max-w-[25%] md:w-[25%]">
          <p className="text-2xl font-medium">Create a review</p>
          <div className=" pt-9">
            {steps.map((step, index) => {
              const status = getSectionStatus(form, step.section);
              const isComplete = status === "complete";
              const isInProgress = status === "in-progress";

              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-semibold text-sm transition-all relative overflow-hidden ${
                        isComplete || isInProgress
                          ? "bg-cooper-yellow-500 text-white"
                          : isInProgress
                            ? "bg-gray-300"
                            : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isInProgress && (
                        <Circle className="h-2.5 w-2.5 fill-white text-white" />
                      )}
                    </button>

                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-7 mt-2 mb-2 ${
                          currentStep > step.id ? "bg-[#F4C27F]" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>

                  <p
                    className={`font-medium text-sm ${
                      currentStep == step.id
                        ? "text-black"
                        : "text-cooper-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-11">
            <Button
              onClick={async () => {
                const isValid = await form.trigger();
                if (!isValid) {
                  const errors = form.formState.errors;
                  console.log("Form validation errors:", errors);
                  toast.error("Please fill in all required fields correctly");
                  return;
                }
                await form.handleSubmit(onSubmit, (errors) => {
                  console.log("Validation errors:", errors);
                  toast.error("Please fix the errors in the form");
                })();
              }}
              className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-6 py-2 text-sm font-semibold text-white hover:border-cooper-yellow-700 hover:bg-cooper-yellow-700"
            >
              Submit
            </Button>
          </div>
        </div>
        <div className="mt-4 pr-3.5 flex h-full flex-col md:max-w-[75%] pl-3.5 md:w-[75%]">
          <FormCollapsableInfoCard
            title={"Basic Information"}
            onClear={() => {
              form.resetField("workTerm");
              form.resetField("workYear");
            }}
          >
            <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap ">
              <BasicInfoSection />
            </div>
          </FormCollapsableInfoCard>
          {canReviewForTerm() ? (
            <div>
              <FormCollapsableInfoCard
                title={"Company Information"}
                onClear={() => {
                  form.resetField("overtimeNormal");
                  form.resetField("workEnvironment");
                  form.resetField("drugTest");
                }}
              >
                <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                  <div className="flex flex-wrap gap-10 lg:flex-nowrap">
                    <CompanyDetailsSection />
                  </div>
                </div>
              </FormCollapsableInfoCard>
              <FormCollapsableInfoCard
                title={"Role Information"}
                onClear={() => {
                  form.resetField("workEnvironment");
                  form.resetField("hourlyPay");
                }}
              >
                <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                  <div className="flex flex-wrap gap-10 lg:flex-nowrap">
                    <RoleInfoSection />
                  </div>
                </div>
              </FormCollapsableInfoCard>
              <FormCollapsableInfoCard title={"Interview"} onClear={() => {}}>
                <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                  <div className="flex flex-wrap gap-10 lg:flex-nowrap">
                    <InterviewSection />
                  </div>
                </div>
              </FormCollapsableInfoCard>
              <FormCollapsableInfoCard
                title={"Final co-op review"}
                onClear={() => {}}
              >
                <div className="flex flex-wrap gap-10 overflow-auto xl:flex-nowrap">
                  <div className="flex flex-wrap gap-10 lg:flex-nowrap">
                    <ReviewSection />
                  </div>
                </div>
              </FormCollapsableInfoCard>
            </div>
          ) : (
            <div>You already submitted too many reviews for this term</div>
          )}
        </div>
      </div>
    </Form>
  );
}
