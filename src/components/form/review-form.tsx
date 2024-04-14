"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dayjs from "dayjs";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ReviewSection } from "~/components/form/review-section";
import { CoopCycleSection } from "~/components/form/coop-cycle-section";
import { CompanyDetailsSection } from "~/components/form/company-details-section";
import { RatingsSection } from "~/components/form/ratings-section";
import { SubmissionConfirmation } from "~/components/form/submission-confirmation";
import { WelcomePage } from "~/components/form/welcome-page";
import { useState } from "react";
import { Company, WorkEnvironment, WorkTerm } from "@prisma/client";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { animateScroll as scroll } from "react-scroll";
import Image from "next/image";

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
  interviewDifficulty: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid interview difficulty rating.",
      }),
    })
    .min(1)
    .max(5),
  interviewReview: z.string().optional(),
  reviewHeadline: z
    .string({
      required_error: "You need to enter a Review Headline.",
    })
    .min(8, {
      message: "The review headline must be at least 8 characters.",
    }),
  textReview: z
    .string({
      required_error: "You need to enter a review for your co-op.",
    })
    .min(8, {
      message: "The review must be at least 8 characters.",
    }),
  location: z.string().optional(),
  hourlyPay: z.coerce.number().optional(),
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

export const benefits = [
  { field: "pto", label: "PTO" },
  { field: "federalHolidays", label: "Federal holidays off" },
  { field: "freeLunch", label: "Free lunch" },
  { field: "freeTransport", label: "Free transportation" },
  { field: "freeMerch", label: "Free merchandise" },
];

const steps: { fields: string[]; color: string }[] = [
  {
    fields: ["workTerm", "workYear"],
    color: "border-cooper-pink-500",
  },
  {
    fields: [
      "overallRating",
      "cultureRating",
      "supervisorRating",
      "interviewRating",
      "interviewDifficulty",
      "interviewReview",
    ],
    color: "border-cooper-green-500",
  },
  {
    fields: ["reviewHeadline", "textReview", "location", "hourlyPay"],
    color: "border-cooper-yellow-500",
  },
  {
    fields: [
      "workEnvironment",
      "drugTest",
      "overtimeNormal",
      "pto",
      "federalHolidays",
      "freeLunch",
      "freeTransport",
      "freeMerch",
      "otherBenefits",
    ],
    color: "border-cooper-red-500",
  },
];

type ReviewFormProps = {
  company: Company;
  roleId: string;
  profileId: string;
};

/**
 * ReviewForm component manages a form for submitting a review. This component
 * integrates React Hook Form with Zod validation for form management and validation.
 */
export function ReviewForm(props: ReviewFormProps) {
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
      location: "",
      hourlyPay: 0,
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

  const [currentStep, setCurrentStep] = useState<number>(0);

  type FieldName = keyof z.infer<typeof formSchema>;

  const next = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const fields = steps[currentStep - 1]?.fields;
    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!output) {
      return;
    }

    if (currentStep <= steps.length) {
      if (currentStep === steps.length) {
        await form.handleSubmit(onSubmit)();
      }
      setCurrentStep((step) => step + 1);
      scroll.scrollToTop({ duration: 250, smooth: true });
    }
  };

  const prev = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
    scroll.scrollToTop({ duration: 250, smooth: true });
  };

  const mutation = api.review.create.useMutation();

  function onSubmit(values: z.infer<ReviewFormType>) {
    mutation.mutate({
      roleId: props.roleId,
      profileId: props.profileId,
      ...values,
    });
  }

  if (currentStep === steps.length + 1) {
    return <SubmissionConfirmation />;
  }

  if (currentStep === 0) {
    return (
      <div className="flex flex-col border-2">
        <div className="z-10 -mb-4 h-4 w-full rounded-t-xl bg-cooper-blue-700" />
        <div className="flex h-[80vh] w-full items-center justify-center rounded-xl bg-white pl-24 pr-4 text-cooper-blue-600">
          <div className="flex w-1/2 flex-col space-y-6">
            <h1 className="text-4xl font-semibold text-cooper-blue-700">
              Submit a Co-op Review!
            </h1>
            <p className="text-2xl text-cooper-blue-700">
              Thank you for taking the time to leave a review of your co-op
              experience! Join others in the Northeastern community and help
              people like yourself make the right career decision.
            </p>
            <Button
              className="w-1/2"
              onClick={() => {
                setCurrentStep((step) => step + 1);
              }}
            >
              Start a review
            </Button>
          </div>
          <Image
            src="/svg/logo.svg"
            alt="Co-op Review Logo"
            width={650}
            height={650}
          />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        className={cn(
          "space-y-12 rounded-2xl border-t-[16px] bg-white px-32 py-16",
          steps[currentStep - 1]?.color,
        )}
      >
        {currentStep == 1 && <CoopCycleSection />}
        {currentStep == 2 && <RatingsSection />}
        {currentStep == 3 && <ReviewSection />}
        {currentStep == 4 && (
          <CompanyDetailsSection companyName={props.company.name} />
        )}
        {currentStep >= 1 && currentStep <= steps.length && (
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={prev}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button onClick={next}>
              {currentStep == steps.length ? "Submit" : "Save and continue"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
