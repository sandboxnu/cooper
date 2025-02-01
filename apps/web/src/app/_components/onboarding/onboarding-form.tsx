import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Session } from "@cooper/auth";
import { cn } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { DialogTitle } from "@cooper/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@cooper/ui/form";

import {
  FormLabel,
  FormMessage,
} from "~/app/_components/themed/onboarding/form";
import { Input } from "~/app/_components/themed/onboarding/input";
import { api } from "~/trpc/react";
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
  cooped: z.boolean({
    required_error: "Please select whether you've completed a co-op before",
  }),
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

  const names = (session.user.name || " ").split(" ");

  const form = useForm<OnboardingFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: names.length > 0 ? names[0] : "",
      lastName: names.length > 1 ? names[1] : "",
      email: session.user.email || "",
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
      <DialogTitle className="pb-2 text-center text-2xl font-bold">
        Create a Cooper Account
      </DialogTitle>
      <Form {...form}>
        <p className="text-gray-500">
          <span className="text-red-500">* </span>Required
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="max-w-72">
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First" {...field} />
                  </FormControl>
                  <FormMessage className="text-base" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="max-w-72">
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last" {...field} />
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
              <FormItem className="max-w-72">
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="major"
              render={({ field }) => (
                <FormItem className="max-w-72">
                  <FormLabel required>Major</FormLabel>
                  <FormControl>
                    <Select
                      placeholder="Major"
                      options={majors.map((major) => ({
                        value: major,
                        label: major,
                      }))}
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
              name="minor"
              render={({ field }) => (
                <FormItem className="max-w-72">
                  <FormLabel>Minor</FormLabel>
                  <FormControl>
                    <Input placeholder="Minor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="graduationYear"
              render={({ field }) => (
                <FormItem className="max-w-72">
                  <FormLabel required>Graduation Year</FormLabel>
                  <FormControl>
                    <Input placeholder="Year" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graduationMonth"
              render={({ field }) => (
                <FormItem className="max-w-72">
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
          </div>
          <FormField
            control={form.control}
            name="cooped"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>
                  Have you completed a co-op before?
                </FormLabel>
                <FormControl>
                  <FormItem className="flex items-center space-x-4">
                    <FormControl>
                      <div>
                        <Button
                          type="button"
                          variant={cooped === true ? "default" : "outline"}
                          className={cn(
                            "mr-0 h-12 rounded-r-none border-2 border-cooper-gray-300 text-lg text-cooper-gray-400 shadow-none ring-offset-background hover:bg-accent hover:text-black focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2",
                            cooped === true && "bg-cooper-blue-200 text-black",
                          )}
                          onClick={() => {
                            setCooped(true);
                            field.onChange(true);
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={cooped === false ? "default" : "outline"}
                          className={cn(
                            "ml-0 h-12 rounded-l-none border-2 border-l-0 border-cooper-gray-300 text-lg text-cooper-gray-400 shadow-none ring-offset-background hover:bg-accent hover:text-black focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-2",
                            cooped === false && "bg-cooper-blue-200 text-black",
                          )}
                          onClick={() => {
                            setCooped(false);
                            field.onChange(false);
                          }}
                        >
                          No
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4 flex justify-end">
            <Button type="submit" className="w-24">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
