"use client";

import { useState } from "react";
import { Button } from "node_modules/@cooper/ui/src/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "node_modules/@cooper/ui/src/card";
import { api } from "~/trpc/react";

type ProfileCardHeaderProps = {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    major: string | null;
    graduationYear: number | null;
  };
  email: string;
};

export default function ProfileCardHeader({
  profile,
  email,
}: ProfileCardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [major, setMajor] = useState(profile.major ?? "");

  const update = api.profile.updateNameAndMajor.useMutation({
    onSuccess: () => {
      setEditing(false);
      window.location.reload();
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-xl">Account Information</CardTitle>
          </div>

          {!editing ? (
            <Button
              variant="outline"
              className="py-2 text-sm h-[28px] border w-[38px] border-gray-400 text-gray-400"
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="py-2 border text-sm h-[28px]"
                onClick={() => {
                  setFirstName(profile.firstName ?? "");
                  setLastName(profile.lastName ?? "");
                  setMajor(profile.major ?? "");
                  setEditing(false);
                }}
                disabled={update.isPending}
              >
                Cancel
              </Button>
              <Button
                className="py-2 text-sm h-[28px]"
                onClick={() =>
                  update.mutate({
                    id: profile.id,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    major: major.trim(),
                  })
                }
                disabled={
                  update.isPending ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !major.trim()
                }
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-0">
        {!editing ? (
          <div className="m-4 grid grid-cols-3 grid-rows-2 items-center gap-4 text-sm">
            <div className="flex flex-col">
              <h4 className="font-semibold">Name</h4>
              <p>
                {profile.firstName} {profile.lastName}
              </p>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold">Email</h4>
              <p className="text-cooper-gray-400">{email}</p>
            </div>
            <div className="flex flex-col">
              <h4 className="font-semibold">Major</h4>
              <p>{profile.major}</p>
            </div>
          </div>
        ) : (
          <form
            className="m-4 grid grid-cols-3 gap-4 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({
                id: profile.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                major: major.trim(),
              });
            }}
          >
            <div className="flex flex-col">
              <label className="font-semibold" htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                className="mt-1 rounded-md border border-gray-300 px-2 py-1"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold" htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className="mt-1 rounded-md border border-gray-300 px-2 py-1"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold" htmlFor="major">
                Major
              </label>
              <input
                id="major"
                className="mt-1 rounded-md border border-gray-300 px-2 py-1"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="mt-1 rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-gray-500"
                value={email}
                disabled
                readOnly
              />
            </div>
          </form>
        )}

        {update.error ? (
          <div className="m-4 text-sm text-red-600">
            {update.error.message ?? "Update failed"}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
