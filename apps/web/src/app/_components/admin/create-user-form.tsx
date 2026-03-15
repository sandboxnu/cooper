"use client";

import { useState } from "react";

import { UserRole, UserRoleType } from "@cooper/db/schema";
import { cn, useCustomToast } from "@cooper/ui";
import { Button } from "@cooper/ui/button";
import { Input } from "@cooper/ui/input";

import { Select } from "~/app/_components/themed/onboarding/select";
import { api } from "~/trpc/react";

export function CreateUserForm() {
  const { toast } = useCustomToast();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");

  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      toast.success("User added successfully.");
      setEmail("");
      setSelectedRole("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex flex-row">
      <Input
        className={cn(
          "border-cooper-gray-150 h-9 border-[1px] pl-5 w-[30%] text-sm text-cooper-gray-400",
        )}
        placeholder="Type email here"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="w-[10%]">
        <Select
          options={[
            { value: UserRole.ADMIN, label: "Admin" },
            { value: UserRole.COORDINATOR, label: "Co-op advisor" },
          ]}
          className="border-cooper-gray-150 h-10 text-sm"
          value={selectedRole}
          placeholder="Select"
          onChange={(e) => {
            setSelectedRole(e.target.value);
          }}
        />
      </div>
      <Button
        type="button"
        className="bg-cooper-gray-550 hover:bg-cooper-gray-600 rounded-lg border-none px-8 py-3 text-lg font-semibold text-white"
        onClick={() => {
          if (!email || !selectedRole) return;
          createUser.mutate({ email, role: selectedRole as UserRoleType });
        }}
      >
        Submit
      </Button>
    </div>
  );
}
