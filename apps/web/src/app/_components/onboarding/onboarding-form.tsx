import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Session } from "@cooper/auth";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { DialogTitle } from "@cooper/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@cooper/ui/form";
import { Checkbox } from "@cooper/ui/checkbox";

import {
  FormLabel,
  FormMessage,
} from "~/app/_components/themed/onboarding/form";
import { Input } from "~/app/_components/themed/onboarding/input";
import { api } from "~/trpc/react";
import ComboBox from "../combo-box";
import { Select } from "../themed/onboarding/select";
import { majors, monthOptions } from "./constants";
import { BrowseAroundPrompt } from "./post-onboarding/browse-around-prompt";
import { CoopPrompt } from "./post-onboarding/coop-prompt";

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("This is not a valid email"),
  major: z.string().min(1, "Major is required"),
  minor: z.string().optional(),
  graduationYear: z.coerce
    .number()
    .min(2010, "Graduation year must be 2010 or later")
    .max(currentYear + 6, "Graduation year must be within the next 5 years"),
  graduationMonth: z.coerce
    .number()
    .min(1, "Graduation month is required")
    .max(12, "Invalid month"),
  cooped: z.boolean().optional(),
});

export type OnboardingFormType = z.infer<typeof formSchema>;

interface OnboardingFormProps {
  userId: string;
  closeDialog: () => void;
  session: Session;
}

/**
 * OnboardingForm component that handles user onboarding.
 * @param userId - The user ID
 * @param closeDialog - The function to close the dialog
 * @param session - The current user session
 * @returns The OnboardingForm component
 */
export function OnboardingForm({
  userId,
  closeDialog,
  session,
}: OnboardingFormProps) {
  const [cooped, setCooped] = useState<boolean | undefined>(undefined);
  const profile = api.profile.create.useMutation();
  const [majorLabel, setMajorLabel] = useState<string>("");

  const names = (session.user.name ?? " ").split(" ");

  const form = useForm<OnboardingFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: names.length > 0 ? names[0] : "",
      lastName: names.length > 1 ? names[1] : "",
      email: session.user.email ?? "",
      major: "",
      minor: undefined,
      graduationYear: undefined,
      graduationMonth: 0,
      cooped: undefined,
    },
  });

  const onSubmit = (data: OnboardingFormType) => {
    profile.mutate({ userId, ...data });
  };

  if (profile.isSuccess) {
    const firstName = form.getValues("firstName");

    return cooped ? (
      <CoopPrompt firstName={firstName} onClick={closeDialog} />
    ) : (
      <BrowseAroundPrompt firstName={firstName} onClick={closeDialog} />
    );
  }

  return (
    <>
      <DialogTitle className="pb-2 text-left text-lg font-medium ">
        Let’s get you setup
      </DialogTitle>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="max-w-72">
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="First"
                      {...field}
                      onClear={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="max-w-72 lg:ml-2">
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Last"
                      {...field}
                      onClear={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@example.com"
                    {...field}
                    onClear={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="major"
              render={() => (
                <FormItem>
                  <FormLabel>Major</FormLabel>
                  <ComboBox
                    variant="form"
                    defaultLabel={majorLabel || "Select major..."}
                    searchPlaceholder="Search major..."
                    searchEmpty="No major found."
                    valuesAndLabels={majors.map((major) => ({
                      value: major,
                      label: major,
                    }))}
                    currLabel={majorLabel}
                    onSelect={(currentValue) => {
                      setMajorLabel(
                        currentValue === majorLabel ? "" : currentValue,
                      );
                      form.setValue("major", currentValue);
                    }}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minor</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Minor"
                      {...field}
                      onClear={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="graduationMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Graduation Month</FormLabel>
                  <FormControl>
                    <Select
                      placeholder="Month"
                      options={monthOptions}
                      className="min-w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graduationYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Graduation Year</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Year"
                      {...field}
                      onClear={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="cooped"
            render={({ field }) => (
              <FormItem className="max-w-72">
                <FormControl>
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={cooped}
                          onCheckedChange={(checked) => {
                            setCooped(checked === true);
                            field.onChange(checked === true);
                          }}
                        />
                        <FormLabel>
                          I have completed a co-op or internship
                        </FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              className=" bg-cooper-gray-550 border-cooper-gray-550 hover:bg-cooper-gray-300 px-3.5 py-2 text-base font-bold"
            >
              Finish
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
