"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import { useForm } from "react-hook-form";

import { Button } from "@cooper/ui/button";

import {
  BasicInfoSection,
  CompanyDetailsSection,
  InterviewSection,
  ReviewSection,
} from "~/app/_components/form/sections";
import Popup from "~/app/_components/form/sections/popup";
import { z } from "zod";
import { useCustomToast } from "@cooper/ui";
import { WorkEnvironment, WorkTerm, JobType, Status } from "@cooper/db/schema";
import dayjs from "dayjs";
import { Form } from "node_modules/@cooper/ui/src/form";
import { PaySection } from "~/app/_components/form/sections/pay-section";
import { api } from "~/trpc/react";

const filter = new Filter();

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
    })
    .nullable(),
  roleName: z
    .string({
      required_error: "You need to enter a company.",
    })
    .min(1, {
      message: "You need to enter a company.",
    })
    .nullable(),
  locationId: z.string().min(1, {
    message: "You need to select a location.",
  }),
  jobType: z.nativeEnum(JobType, {
    message: "You need to select a job type.",
  }),
  hourlyPay: z.coerce
    .number()
    .min(0, {
      message: "Please enter hourly pay",
    })
    .transform((val) => (Number.isNaN(val) ? null : val.toString()))
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
  federalHolidays: z.boolean(),
  freeLunch: z.boolean(),
  travelBenefits: z.boolean(),
  freeMerch: z.boolean(),
  snackBar: z.boolean(),
  employeeLounge: z.boolean(),
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
  const [showModal, setShowModal] = useState(false);

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

  const isDirty = form.formState.isDirty;
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    form.reset();
    setShowModal(false);
    isDirtyRef.current = false;
  }, [form]);

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

  useEffect(() => {
    const handleLeave: EventListener = () => {
      if (isDirtyRef.current) {
        setShowModal(true);
      } else {
        router.push("/");
        //not going to /profile
      }
    };
    window.addEventListener("review-form:leave-attempt", handleLeave);

    return () => {
      window.removeEventListener("review-form:leave-attempt", handleLeave);
    };
  }, [router]);

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
        review.status === Status.PUBLISHED &&
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

  const draftMutation = api.review.saveDraft.useMutation({
    onSuccess: () => {
      router.push("/");
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save draft. Please try again.");
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
        status: Status.PUBLISHED,
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

  const discardDraft = () => {
    router.push("/");
  };

  const normalizeRadios = (v: unknown) =>
    v === true || v === "yes" ? true : v === false || v === "no" ? false : null;

  async function onSaveDraft() {
    try {
      const values = form.getValues();

      const draftPayload: Record<string, unknown> = {
        roleId: roleId,
        profileId: profileId,
        companyId: companyId,
        workTerm: values.workTerm,
        workYear: values.workYear,
        overallRating: values.overallRating,
        cultureRating: values.cultureRating,
        supervisorRating: values.supervisorRating,
        interviewRating: 1,
        interviewDifficulty: values.interviewDifficulty || null,
        interviewReview: values.interviewReview ?? null,
        reviewHeadline: "",
        textReview: values.textReview || null,
        locationId: values.locationId || null,
        jobType: values.jobType,
        hourlyPay: values.hourlyPay || null,
        workEnvironment: values.workEnvironment,
        drugTest: normalizeRadios(values.drugTest),
        pto: normalizeRadios(values.pto),
        overtimeNormal: normalizeRadios(values.overtimeNormal),
        federalHolidays: values.federalHolidays || null,
        freeLunch: values.freeLunch || null,
        travelBenefits: values.travelBenefits || null,
        freeMerch: values.freeMerch || null,
        snackBar: values.snackBar || null,
        otherBenefits: values.otherBenefits ?? null,
        status: Status.DRAFT,
      };

      await draftMutation.mutateAsync(
        draftPayload as Parameters<typeof draftMutation.mutateAsync>[0],
      );

      form.reset(values);
      isDirtyRef.current = false;
      toast.success("This draft has been saved.");
    } catch (error) {
      console.error("Draft save failed:", error);
    }
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
      <div
        className={`${showModal ? "pointer-events-none" : ""} flex h-screen w-full flex-col items-center justify-center overflow-auto bg-white md:flex-row`}
      >
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
              <div className="flex gap-2 justify-end">
                {/* Save Draft Button */}
                <div className="pb-12 pt-6">
                  <Button
                    type="button"
                    onClick={onSaveDraft}
                    disabled={mutation.isPending || draftMutation.isPending}
                    className="bg-white hover:bg-cooper-gray-600
                  rounded-lg border border-cooper-gray-150 2-253 px-8 py-3 text-lg font-semibold
                  text-[#151515]"
                  >
                    {draftMutation.isPending ? "Saving draft..." : "Save draft"}
                  </Button>
                </div>
                {/* Submit Button */}
                <div className="pb-12 pt-6">
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
                    disabled={mutation.isPending || draftMutation.isPending}
                    className="bg-cooper-gray-550 hover:bg-cooper-gray-600 rounded-lg border-none px-8 py-3 text-lg font-semibold text-white"
                  >
                    {mutation.isPending ? "Submitting..." : "Submit review"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>You already submitted too many reviews for this term</div>
          )}
        </div>
        {isDirty && showModal && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
            <div className="pointer-events-auto">
              <Popup
                showModal={showModal}
                onCancel={() => setShowModal(false)}
                onDiscard={discardDraft}
                onSave={onSaveDraft}
              />
            </div>
          </div>
        )}
      </div>
    </Form>
  );
}
