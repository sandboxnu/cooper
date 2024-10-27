import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@cooper/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@cooper/ui/form";

import { FormLabel } from "~/app/_components/themed/onboarding/form";
import { Input } from "~/app/_components/themed/onboarding/input";
import { api } from "~/trpc/react";
import { Select } from "../themed/onboarding/select";
import { majors, monthOptions } from "./constants";

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
    .max(2030, "Graduation year must be 2030 or earlier"),
  graduationMonth: z.coerce
    .number()
    .min(1, "Graduation month is required")
    .max(12, "Invalid month"),
  cooped: z.boolean(),
});

export type OnboardingFormType = typeof formSchema;

interface OnboardingFormProps {
  userId: string;
}

export function OnboardingForm({ userId }: OnboardingFormProps) {
  const profile = api.profile.create.useMutation();

  const form = useForm<z.infer<OnboardingFormType>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      major: "",
      minor: "",
      graduationYear: undefined,
      graduationMonth: 0,
      cooped: false,
    },
  });

  const onSubmit = (data: z.infer<OnboardingFormType>) => {
    profile.mutate({ userId, ...data });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-6"
      >
        <div className="flex space-x-20">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
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
            <FormItem className="w-[275px]">
              <FormLabel required>Email</FormLabel>
              <FormControl>
                <Input placeholder="example@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-20">
          <FormField
            control={form.control}
            name="major"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Major</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Major"
                    options={majors.map((major) => ({
                      value: major,
                      label: major,
                    }))}
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
              <FormItem>
                <FormLabel>Minor</FormLabel>
                <FormControl>
                  <Input placeholder="Minor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-20">
          <FormField
            control={form.control}
            name="graduationYear"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel required>Graduation Month</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Month"
                    options={monthOptions}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
}
