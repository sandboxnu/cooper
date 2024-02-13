"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ReviewSection } from "~/components/review-section";
import { CoopCycleSection } from "~/components/coop-cycle-section";
import { CompanyDetailsSection } from "~/components/company-details-section";
import { RatingsSection } from "~/components/ratings-section";

const formSchema = z.object({
  coopCycle: z.enum(["Fall", "Spring", "Other..."], {
    required_error: "You need to select a co-op cycle.",
  }),
  coopYear: z.coerce
    .number({
      required_error: "You need to select a co-op year.",
    })
    .min(2022, {
      message: "The co-op year should be greater than or equal to 2022",
    })
    .max(2024, {
      message: "The co-op year should be less than or equal to 2024",
    }),
  coopExperience: z.coerce
    .number()
    .min(1, {
      message: "Please select a valid co-op experience rating.",
    })
    .max(5, {
      message: "Please select a valid co-op experience rating.",
    }),
  companyCulture: z.coerce
    .number()
    .min(1, {
      message: "Please select a valid company culture rating.",
    })
    .max(5, {
      message: "Please select a valid company culture rating.",
    }),
  supervisorRating: z.coerce
    .number()
    .min(1, {
      message: "Please select a valid supervisor rating.",
    })
    .max(5, {
      message: "Please select a valid supervisor rating.",
    }),
  interviewExperienceRating: z.coerce
    .number()
    .min(1, {
      message: "Please select a interview experience rating.",
    })
    .max(5, {
      message: "Please select a interview experience rating.",
    }),
  interviewDifficulty: z.coerce
    .number()
    .min(1, {
      message: "Please select a valid interview difficulty rating.",
    })
    .max(5, {
      message: "Please select a valid interview difficulty rating.",
    }),
  interviewExperience: z.string().optional(),
  reviewHeadline: z
    .string({
      required_error: "You need to enter a Review Headline.",
    })
    .min(8, {
      message: "The review headline must be at least 8 characters.",
    }),
  textReview: z.string({
    required_error: "You need to enter a review for your co-op.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  hourlyPay: z.coerce.number().min(1, {
    message: "Hourly pay must be valid.",
  }),
  workModel: z.enum(["In-person", "Hybrid", "Remote"], {
    required_error: "You need to select a work model.",
  }),
  drugTest: z
    .string({
      required_error: "You need to select whether you were drug-tested.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  overtimeCommon: z
    .string({
      required_error: "You need to select whether working overtime was common.",
    })
    .transform((x) => x === "true")
    .pipe(z.boolean()),
  pto: z.boolean().default(false).optional(),
  federalHolidaysOff: z.boolean().default(false).optional(),
  freeLunch: z.boolean().default(false).optional(),
  freeTransport: z.boolean().default(false).optional(),
  freeMerch: z.boolean().default(false).optional(),
  otherBenefits: z.string().optional(),
});

export type ReviewFormType = typeof formSchema;

// There's probably a more elegant way of linking this to the Zod schema
export const benefits = [
  { field: "pto", label: "PTO" },
  { field: "federalHolidaysOff", label: "Federal holidays off" },
  { field: "freeLunch", label: "Free lunch" },
  { field: "freeTransportation", label: "Free transportation" },
  { field: "freeMerch", label: "Free merchandise" },
];

export function ReviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coopCycle: undefined,
      coopYear: undefined,
      coopExperience: 0,
      companyCulture: 0,
      supervisorRating: 0,
      interviewExperienceRating: 0,
      interviewDifficulty: 0,
      interviewExperience: "",
      reviewHeadline: "",
      textReview: "",
      location: "",
      hourlyPay: 0,
      workModel: undefined,
      drugTest: undefined,
      overtimeCommon: undefined,
      pto: false,
      federalHolidaysOff: false,
      freeLunch: false,
      freeTransport: false,
      freeMerch: false,
      otherBenefits: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CoopCycleSection />
        <RatingsSection />
        <ReviewSection />
        <CompanyDetailsSection />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
