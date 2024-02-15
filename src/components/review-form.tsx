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
  const headerSections = [
    { title: "Co-op Cycle", range: { l: 0, r: 830 } },
    { title: "Ratings", range: { l: 830, r: 1120 } },
    { title: "Review", range: { l: 1120, r: 1780 } },
    { title: "Company Details", range: { l: 1780, r: 2600 } },
    { title: "Submit", range: { l: 2600, r: 10000000 } },
  ] as const;

  // Header Sticky State
  const [headerPercentage, setHeaderPercentage] = useState<number>(50);
  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [higlightedSectionIdx, setHighlightedSectionIdx] = useState<number>(0);
  useEffect(() => {
    // Helper Function
    const indexOfRange = (num: number): number => {
      let out = 0;
      headerSections.forEach((section, idx) => {
        if (num >= section.range.l && num < section.range.r) {
          out = idx;
          return;
        }
      });
      return out;
    };

    // Scroll Handler
    const handleScroll = () => {
      // Set the header percentage to be either 100% width or some linear interpolation that has a minimum of 50%
      setHeaderPercentage(
        window.scrollY >= 20 ? 100 : Math.round(window.scrollY * 2.5) + 50,
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
      <div
        className={`my-8 block ${isSticky ? "sticky top-[-18%] md:top-[-17%] lg:top-[-16%] xl:top-[-14%]" : ""}`}
      >
        <div
          className={`space-4 flex min-w-[66vw] flex-col rounded-xl bg-white p-8 ${isSticky ? "outline" : ""}`}
          style={{
            width: `${headerPercentage}vw`,
            transition: "width 0.3s; outline 0.7s",
          }}
        >
          <h1 className="text-3xl font-semibold">Submit a Co-op Review</h1>
          <p className="my-4">
            description about this form here - Lorem ipsum dolor sit amet,
            consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore ma.
          </p>
          <div className={`mt-8 flex justify-around`}>
            {headerSections.map((section, idx) => {
              const widthProp = ` w-[${1 / headerSections.length}%]`;
              return (
                <div
                  className={"flex flex-col items-center" + widthProp}
                  key={section.title + idx}
                >
                  <div
                    className={`space-8 mx-6 mt-4 flex h-8 w-8 flex-col items-center justify-center rounded-full border-2 border-black font-semibold lg:h-11 lg:w-11 ${higlightedSectionIdx === idx ? "bg-blue-200" : ""}`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-center">{section.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
    </>
  );
}
