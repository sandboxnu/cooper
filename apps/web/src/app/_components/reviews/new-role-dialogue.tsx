import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Filter } from "bad-words";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@cooper/ui/form";
import { useCustomToast } from "@cooper/ui/hooks/use-custom-toast";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Textarea } from "@cooper/ui/textarea";

import { api } from "~/trpc/react";

const filter = new Filter();
const roleSchema = z.object({
  title: z
    .string({ required_error: "You need to enter a role title." })
    .min(5, {
      message: "The role title must be at least 5 characters.",
    })
    .refine((val) => !filter.isProfane(val), {
      message: "The title cannot contain profane words.",
    }),
  description: z
    .string()
    .min(10, {
      message: "The review must be at least 10 characters.",
    })
    .max(500, {
      message: "The description must be at most 500 characters.",
    })
    .refine((val) => !filter.isProfane(val), {
      message: "The description cannot contain profane words.",
    }),
  companyId: z.string(),
  createdBy: z.string(),
});

export type RoleRequestType = typeof roleSchema;

interface NewRoleDialogProps {
  companyId: string;
  disabled?: boolean;
}

export default function NewRoleDialog({
  companyId,
  disabled,
}: NewRoleDialogProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const company = api.company.getById.useQuery({ id: companyId });
  const [roleName, setRoleName] = useState("");

  const { data: profile } = api.profile.getCurrentUser.useQuery();
  const profileId = profile?.id;

  const createdRoles =
    api.role.getByCreatedBy.useQuery(
      { createdBy: profileId ?? "" },
      { enabled: !!profileId },
    ).data ?? [];
  const createdRolesCount = createdRoles.length;

  const form = useForm<z.infer<RoleRequestType>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      title: "",
      description: "",
      companyId: companyId,
      createdBy: profileId,
    },
  });

  const { toast } = useCustomToast();

  const mutation = api.role.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      setRoleName(form.getValues().title);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });

  async function onSubmit(values: z.infer<RoleRequestType>) {
    try {
      const result = await form.trigger(["title", "description"], {
        shouldFocus: true,
      });

      if (!result) {
        return;
      }

      await mutation.mutateAsync(values);
    } catch (error) {
      console.error(error);
    }
  }

  const titleWithoutCoop = roleName.replace(/co-op/gi, "").trim();

  return (
    <Dialog>
      <DialogTrigger className="rounded-lg" asChild>
        <Button
          disabled={disabled}
          className="h-9 rounded-lg border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-4 py-3 text-sm font-semibold text-white hover:border-cooper-yellow-300 hover:bg-cooper-yellow-300"
        >
          + Create New Role
        </Button>
      </DialogTrigger>
      {createdRolesCount && createdRolesCount > 3 ? (
        <DialogContent className="w-full bg-white py-14">
          <DialogTitle>Sorry, you can only create up to 4 roles!</DialogTitle>
        </DialogContent>
      ) : (
        <DialogContent className="w-full bg-white">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <h2 className="text-xl font-semibold text-cooper-green-500">
                Success!
              </h2>
              <p className="text-center text-gray-600">
                The {titleWithoutCoop} Co-op has been successfully added to{" "}
                {company.data?.name}.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Request a new role for {company.data?.name}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <div className="flex flex-col gap-4 py-4">
                  <FormField
                    control={form.control}
                    name="title"
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
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Description</Label>
                        <FormControl>
                          <Textarea variant="dialogue" {...field} />
                        </FormControl>
                        <FormMessage className="text-sm" />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
              <DialogFooter>
                <Button
                  type="submit"
                  className="border-none bg-cooper-yellow-500 text-white hover:bg-cooper-yellow-300"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={!form.formState.isValid}
                >
                  Submit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
