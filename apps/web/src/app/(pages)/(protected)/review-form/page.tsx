"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import dayjs from "dayjs";
import { Form } from "node_modules/@cooper/ui/src/form";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Industry,
  JobType,
  WorkEnvironment,
  WorkTerm,
} from "@cooper/db/schema";
import { useCustomToast } from "@cooper/ui";
import { Button } from "@cooper/ui/button";

import {
  BasicInfoSection,
  CompanyDetailsSection,
  InterviewSection,
  ReviewSection,
} from "~/app/_components/form/sections";
import { PaySection } from "~/app/_components/form/sections/pay-section";
import { api } from "~/trpc/react";

const filter = new Filter();

const formSchema = z.object({
  workTerm: z.nativeEnum(WorkTerm, {
    required_error: "You need to select a co-op cycle.",
  }),
  industry: z.nativeEnum(Industry, {
    required_error: "You need to select an industry.",
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
  interviewDifficulty: z.coerce
    .number({
      errorMap: () => ({
        message: "Please select a valid interview difficulty rating.",
      }),
    })
    .min(1)
    .max(5),
  interviewReview: z
    .string()
    .optional()
    .refine((val) => !filter.isProfane(val ?? ""), {
      message: "The interview review cannot contain profane words.",
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
  companyName: z
    .string({
      required_error: "You need to enter a company.",
    })
    .min(1, {
      message: "You need to enter a company.",
    }),
  roleName: z
    .string({
      required_error: "You need to enter a company.",
    })
    .min(1, {
      message: "You need to enter a company.",
    }),
  locationId: z.string().min(1, {
    message: "You need to select a location.",
  }),
  jobType: z.nativeEnum(JobType, {
    message: "You need to select a job type.",
  }),
  hourlyPay: z.coerce
    .number()
    .min(1, {
      message: "Please enter hourly pay",
    })
    .transform((val) => (val ? val.toString() : null))
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
  federalHolidays: z.boolean().default(false),
  freeLunch: z.boolean().default(false),
  travelBenefits: z.boolean().default(false),
  freeMerch: z.boolean().default(false),
  snackBar: z.boolean().default(false),
  employeeLounge: z.boolean().default(false),
  otherBenefits: z.string().nullable(),
});

export type ReviewFormType = typeof formSchema;
export default function ReviewForm() {
  const router = useRouter();

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

  const { toast } = useCustomToast();
  const [roleId, setRoleId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");

  const form = useForm<z.infer<ReviewFormType>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workTerm: undefined,
      workYear: undefined,
      overallRating: 0,
      cultureRating: 0,
      supervisorRating: 0,
      interviewDifficulty: 0,
      interviewReview: "",
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
      freeMerch: false,
      otherBenefits: "",
      roleName: "",
      companyName: "",
    },
  });

  // Watch form values and update roleId and companyId
  const roleName = form.watch("roleName");
  const companyName = form.watch("companyName");

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
      router.push("/");
    },
    onError: (error) => {
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
        interviewRating: 1,
        reviewHeadline: "",
      });
    } catch (error) {
      // Error is already handled by onError callback
      console.error("Mutation failed:", error);
    }
  }

  if (!sessionLoading && !profileLoading && (!session || !profile)) {
    router.push("/");
  }

  if (!session || !profile) {
    return null;
  }

  // if (submitted) {
  //   if (validForm) {
  //     return <SubmissionConfirmation />;
  //   } else {
  //     return <SubmissionFailure message={errorMessage ?? undefined} />;
  //   }
  // }

  return (
    <Form {...form}>
      <div className="flex h-screen w-full flex-col items-center justify-center overflow-auto bg-white md:flex-row">
        <div className="justify-left mt-4 flex h-full w-[65%] flex-col pr-3.5 pt-10">
          <div className="text-cooper-gray-550 text-lg">Basic information</div>
          <div className="flex w-full flex-wrap gap-10 pb-12 xl:flex-nowrap">
            <BasicInfoSection profileId={profileId} />
          </div>
          <hr />
          {canReviewForTerm() ? (
            <div>
              <div className="text-cooper-gray-550 pt-12 text-lg">
                On the job
              </div>
              <div className="flex flex-wrap gap-10 overflow-auto pb-12 xl:flex-nowrap">
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

              {/* Submit Button */}
              <div className="flex justify-end pb-12 pt-6">
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
                  disabled={mutation.isPending}
                  className="bg-cooper-gray-550 hover:bg-cooper-gray-600 rounded-lg border-none px-8 py-3 text-lg font-semibold text-white"
                >
                  {mutation.isPending ? "Submitting..." : "Submit review"}
                </Button>
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
