import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import { Form, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@cooper/ui/button";
import { DialogFooter } from "@cooper/ui/dialog";
import { FormControl, FormField, FormItem, FormMessage } from "@cooper/ui/form";
import { toast } from "@cooper/ui/hooks/use-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Textarea } from "@cooper/ui/textarea";

import { api } from "~/trpc/react";
import { industryOptions } from "../../onboarding/constants";
import { Select } from "../../themed/onboarding/select";

const filter = new Filter();
const CreateCompanyWithRoleSchema = z.object({
  companyName: z
    .string({ required_error: "Company name is required" })
    .min(3)
    .max(50)
    .refine((val) => !filter.isProfane(val), {
      message: "Company name cannot contain profane words",
    }),
  description: z
    .string({ required_error: "Description is required" })
    .min(10)
    .max(500)
    .refine((val) => !filter.isProfane(val), {
      message: "Description cannot contain profane words",
    }),
  industry: z.string({ required_error: "Industry is required" }).refine(
    (val) => {
      return val !== "Select an industry";
    },
    {
      message: "Industry is required",
    },
  ),
  website: z
    .string({ required_error: "Website is required" })
    .url()
    .refine((val) => !filter.isProfane(val), {
      message: "Website cannot contain profane words",
    }),
  roleTitle: z
    .string({ required_error: "Role title is required" })
    .min(3)
    .max(50)
    .refine((val) => !filter.isProfane(val), {
      message: "Role title cannot contain profane words",
    }),
  roleDescription: z
    .string({ required_error: "Role description is required" })
    .min(10)
    .max(500)
    .refine((val) => !filter.isProfane(val), {
      message: "Role description cannot contain profane words",
    }),
  createdBy: z.string(),
});

interface NewCompanyContentProps {
  profileId?: string;
}

export default function NewCompanyContent({
  profileId,
}: NewCompanyContentProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const newCompanyAndRoleForm = useForm<
    z.infer<typeof CreateCompanyWithRoleSchema>
  >({
    resolver: zodResolver(CreateCompanyWithRoleSchema),
    defaultValues: {
      companyName: "",
      description: "",
      industry: "",
      website: "",
      roleTitle: "",
      roleDescription: "",
      createdBy: profileId,
    },
  });

  const newRoleAndCompanyMutation = api.company.createWithRole.useMutation({
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Submission Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  async function handleSubmit() {
    const res = await newCompanyAndRoleForm.trigger(
      [
        "companyName",
        "description",
        "industry",
        "website",
        "roleTitle",
        "roleDescription",
      ],
      {
        shouldFocus: true,
      },
    );

    if (!res) {
      return;
    }

    setIsLoading(true);

    try {
      const newRoleId = await newRoleAndCompanyMutation.mutateAsync({
        ...newCompanyAndRoleForm.getValues(),
      });
      router.push("/review?id=" + newRoleId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="mt-2 flex flex-col gap-3">
        <FormProvider {...newCompanyAndRoleForm}>
          <Form>
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold">Company Info</h2>
              <FormField
                control={newCompanyAndRoleForm.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <Label>Company Name</Label>
                    <FormControl>
                      <Input
                        type="string"
                        variant="dialogue"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={newCompanyAndRoleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label>
                      Role Description{" "}
                      {newCompanyAndRoleForm.watch("companyName") && (
                        <a
                          className="cursor-pointer text-sm font-black"
                          href={`https://levels.fyi/companies/${newCompanyAndRoleForm.watch("companyName")}`}
                          target="_blank"
                        >
                          ?
                        </a>
                      )}
                    </Label>
                    <FormControl>
                      <Textarea variant="dialogue" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={newCompanyAndRoleForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <Label>Website</Label>
                    <FormControl>
                      <Input
                        type="string"
                        variant="dialogue"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={newCompanyAndRoleForm.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <Label>Industry</Label>
                    <FormControl>
                      <Select
                        placeholder="Select an industry"
                        options={industryOptions}
                        className="min-w-full max-w-fit border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <h2 className="mt-4 text-lg font-bold">Role Info</h2>
              <FormField
                control={newCompanyAndRoleForm.control}
                name="roleTitle"
                render={({ field }) => (
                  <FormItem>
                    <Label>Role Name</Label>
                    <FormControl>
                      <Input type="string" variant="dialogue" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={newCompanyAndRoleForm.control}
                name="roleDescription"
                render={({ field }) => (
                  <FormItem>
                    <Label>Role Description</Label>
                    <FormControl>
                      <Textarea variant="dialogue" {...field} />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </FormProvider>
      </div>
      <DialogFooter className="mt-4">
        <Button
          className="border-none bg-cooper-yellow-500 text-white hover:bg-cooper-yellow-300"
          disabled={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Loading..." : "Start Review"}
        </Button>
      </DialogFooter>
    </>
  );
}
