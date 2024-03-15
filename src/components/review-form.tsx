"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dayjs from "dayjs";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { toast } from "sonner";
import { ReviewSection } from "~/components/review-section";
import { CoopCycleSection } from "~/components/coop-cycle-section";
import { CompanyDetailsSection } from "~/components/company-details-section";
import { RatingsSection } from "~/components/ratings-section";
import { useState } from "react";
import { Company, WorkEnvironment, WorkTerm } from "@prisma/client";
import { api } from "~/trpc/react";

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

const steps = [
  {
    fields: ["workTerm", "workYear"],
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
  },
  {
    fields: ["reviewHeadline", "textReview", "location", "hourlyPay"],
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

  const [currentStep, setCurrentStep] = useState(0);

  type FieldName = keyof z.infer<typeof formSchema>;

  const next = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const fields = steps[currentStep]?.fields;
    const output = await form.trigger(fields as FieldName[], {
      shouldFocus: true,
    });

    if (!output) {
      return;
    }

    if (currentStep < steps.length) {
      if (currentStep === steps.length - 1) {
        await form.handleSubmit(onSubmit)();
      }
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const mutation = api.review.create.useMutation();

  function onSubmit(values: z.infer<ReviewFormType>) {
    mutation.mutate({
      roleId: props.roleId,
      profileId: props.profileId,
      ...values,
    });
  }

  function onReset() {
    form.reset();
  }

  return (
    <Form {...form}>
      <form className="space-y-6">
        {currentStep == 0 && <CoopCycleSection />}
        {currentStep == 1 && <RatingsSection />}
        {currentStep == 2 && <ReviewSection />}
        {currentStep == 3 && (
          <CompanyDetailsSection companyName={props.company.name} />
        )}
        {currentStep >= 0 && currentStep <= steps.length - 1 && (
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={prev}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button onClick={next}>
              {currentStep == steps.length - 1 ? "Submit" : "Next"}
            </Button>
          </div>
        )}
      </form>
      {currentStep == steps.length && (
        <h1 className="text-center text-3xl font-semibold">
          Thank you for submitting your review!
        </h1>
      )}
    </Form>
  );
}
