"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ReviewSection } from "~/components/review-section";
import { CoopCycleSection } from "~/components/coop-cycle-section";
import { CompanyDetailsSection } from "~/components/company-details-section";

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
});

export function ReviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coopCycle: undefined,
      coopYear: undefined,
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
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CoopCycleSection />
        <ReviewSection />
        <CompanyDetailsSection />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
