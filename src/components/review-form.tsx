"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import dayjs from "dayjs";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ReviewSection } from "~/components/review-section";
import { CoopCycleSection } from "~/components/coop-cycle-section";
import { CompanyDetailsSection } from "~/components/company-details-section";
import { RatingsSection } from "~/components/ratings-section";
import { WorkEnvironment, WorkTerm } from "@prisma/client";

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

// There's probably a more elegant way of linking this to the Zod schema
export const benefits = [
  { field: "pto", label: "PTO" },
  { field: "federalHolidays", label: "Federal holidays off" },
  { field: "freeLunch", label: "Free lunch" },
  { field: "freeTransport", label: "Free transportation" },
  { field: "freeMerch", label: "Free merchandise" },
];

/**
 * ReviewForm component manages a form for submitting a review. This component
 * integrates React Hook Form with Zod validation for form management and validation.
 */
export function ReviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  function onReset() {
    form.reset();
  }

  return (
    <div className="mx-auto px-4 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onReset={onReset}
            className="space-y-6"
          >
            <CoopCycleSection />
            <RatingsSection />
            <ReviewSection />
            <CompanyDetailsSection />
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" type="reset">
                Clear form
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
