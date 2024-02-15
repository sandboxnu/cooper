"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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

  // Header Data
  // going to fix the below TODO useMemo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const headerSections: { title: string; bound: number }[] = [
    { title: "Co-op Cycle", bound: 400 },
    { title: "Ratings", bound: 800 },
    { title: "Review", bound: 1200 },
    { title: "Company Details", bound: 1600 },
    { title: "Submit", bound: 10000000 },
  ];

  // Header Sticky State
  const [headerPercentage, setHeaderPercentage] = useState<number>(40);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [higlightedSectionIdx, setHighlightedSectionIdx] = useState<number>(0);
  useEffect(() => {
    // Helper Function
    const indexOfRange = (num: number): number => {
      let item = headerSections.find(({ title, bound }) => num < bound);
      return item ? headerSections.indexOf(item) : 0;
    };

    // Scroll Handler
    const handleScroll = () => {
      // Set the header percentage to be either 100% width or some linear interpolation that has a minimum of 50%
      setHeaderPercentage(
        window.scrollY >= 20 ? 100 : Math.round(window.scrollY * 2.5) + 40,
      );
      setIsSticky(window.scrollY > 20);
      setHighlightedSectionIdx(indexOfRange(window.scrollY));
      console.log(window.scrollY, indexOfRange(window.scrollY));
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headerSections]);

  function onReset() {
    form.reset();
  }

  return (
    <>
      <header
        className={`relative z-10 mt-8 flex justify-center ${isSticky ? "sticky top-[-2rem] sm:top-[-5rem]" : ""}`}
      >
        <div
          className={`space-4 relative flex min-w-[95vw] flex-col rounded-xl bg-white p-8 sm:min-w-[66vw] ${isSticky ? "outline" : ""}`}
          style={{
            width: `${headerPercentage}vw`,
            transition: "width 0.3s; outline 0.7s",
          }}
        >
          <div
            className={`min-w-full ${headerPercentage == 100 && "opacity-0"}`}
            style={{
              width: `${headerPercentage}vw`,
              transition: "opacity 0.3s",
            }}
          >
            <h1 className="text-3xl font-semibold">Submit a Co-op Review</h1>
            <p className="my-4">description about this form here.</p>
          </div>
          <div className={`mt-2 flex justify-around`}>
            {headerSections.map((section, idx) => {
              return (
                <div
                  className={
                    "flex flex-col items-center " +
                    `w-[${1 / headerSections.length}%]`
                  }
                  key={section.title + idx}
                >
                  {/* THE CIRCLES */}
                  <div
                    className={`flex h-6 w-6 flex-col items-center justify-center rounded-full border border-black text-base md:h-8 md:w-8 md:border-2 md:font-semibold lg:h-11 lg:w-11 ${higlightedSectionIdx === idx ? "bg-blue-200" : ""}`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-center">{section.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </header>
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
    </>
  );
}
