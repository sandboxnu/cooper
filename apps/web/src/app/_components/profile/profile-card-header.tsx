"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "node_modules/@cooper/ui/src/card";

import { cn } from "@cooper/ui";

import { api } from "~/trpc/react";
import ComboBox from "../combo-box";
import { majors } from "../onboarding/constants";
import { Input } from "../themed/onboarding/input";

// Same buttons as the review view/edit pop-up
const BUTTON_CLASS =
  "h-9 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50";
const PRIMARY_BUTTON_CLASS = `${BUTTON_CLASS} border-none bg-cooper-gray-550 text-white hover:bg-cooper-gray-600`;
const SECONDARY_BUTTON_CLASS = `${BUTTON_CLASS} border border-gray-300 bg-white text-black hover:bg-[#F6F6F6]`;

// Same field styling as the onboarding form
const LABEL_CLASS = "text-sm font-bold text-black";

interface ProfileCardHeaderProps {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    major: string | null;
    graduationYear: number | null;
  };
}

// Same range the onboarding form and the profile schema allow
const currentYear = new Date().getFullYear();
const isValidGraduationYear = (year: string) => {
  const n = Number(year);
  return Number.isInteger(n) && n >= currentYear - 5 && n <= currentYear + 6;
};

export default function ProfileCardHeader({ profile }: ProfileCardHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [major, setMajor] = useState(profile.major ?? "");
  const [graduationYear, setGraduationYear] = useState(
    profile.graduationYear?.toString() ?? "",
  );
  const utils = api.useUtils();

  const update = api.profile.updateNameAndMajor.useMutation({
    onSuccess: async () => {
      await utils.profile.getCurrentUser.invalidate(); //to refresh user data after update
      setEditing(false);
    },
  });

  return (
    <Card className="hover:bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-xl">Account Information</CardTitle>
          </div>

          {!editing ? (
            <button
              type="button"
              className={cn(SECONDARY_BUTTON_CLASS, "text-cooper-gray-400")}
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                className={SECONDARY_BUTTON_CLASS}
                onClick={() => {
                  setFirstName(profile.firstName);
                  setLastName(profile.lastName);
                  setMajor(profile.major ?? "");
                  setGraduationYear(profile.graduationYear?.toString() ?? "");
                  setEditing(false);
                }}
                disabled={update.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className={PRIMARY_BUTTON_CLASS}
                onClick={() =>
                  update.mutate({
                    id: profile.id,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    major: major.trim(),
                    graduationYear: graduationYear.trim()
                      ? Number(graduationYear)
                      : null,
                  })
                }
                disabled={
                  update.isPending ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !major.trim() ||
                  (!!graduationYear.trim() &&
                    !isValidGraduationYear(graduationYear))
                }
              >
                {update.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-0">
        {!editing ? (
          // Lines up with the title; the card's own padding sets the margins
          // No name here; it's already the page heading
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {profile.major && (
              <div className="flex flex-col gap-1">
                <h4 className="font-semibold">Major</h4>
                <p className="text-base">{profile.major}</p>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">Graduation year</h4>
              <p className="text-base">{profile.graduationYear ?? "--"}</p>
            </div>
          </div>
        ) : (
          <form
            // Grid cells shrink with the card, so the inputs wrap instead of
            // overflowing it
            className="grid grid-cols-1 gap-x-4 gap-y-5 text-sm md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({
                id: profile.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                major: major.trim(),
                graduationYear: graduationYear.trim()
                  ? Number(graduationYear)
                  : null,
              });
            }}
          >
            <div className="flex min-w-0 flex-col gap-2">
              <label className={LABEL_CLASS} htmlFor="firstName">
                First Name<span className="ml-1 text-red-500">*</span>
              </label>
              <Input
                id="firstName"
                placeholder="First"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onClear={() => setFirstName("")}
              />
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <label className={LABEL_CLASS} htmlFor="lastName">
                Last Name<span className="ml-1 text-red-500">*</span>
              </label>
              <Input
                id="lastName"
                placeholder="Last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onClear={() => setLastName("")}
              />
            </div>
            {profile.major && (
              <div className="flex min-w-0 flex-col gap-2">
                <span className={LABEL_CLASS}>
                  Major<span className="ml-1 text-red-500">*</span>
                </span>
                <ComboBox
                  variant="form"
                  defaultLabel="Select major..."
                  searchPlaceholder="Search major..."
                  searchEmpty="No major found."
                  valuesAndLabels={majors.map((m) => ({ value: m, label: m }))}
                  currLabel={major}
                  selectedClassName="text-cooper-gray-900"
                  forceOpenBelow
                  listClassName="max-h-[200px]"
                  onSelect={(currentValue) =>
                    setMajor(currentValue === major ? "" : currentValue)
                  }
                />
              </div>
            )}
            <div className="flex min-w-0 flex-col gap-2">
              <label className={LABEL_CLASS} htmlFor="graduationYear">
                Graduation Year
              </label>
              <Input
                id="graduationYear"
                placeholder="Year"
                inputMode="numeric"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                onClear={() => setGraduationYear("")}
              />
            </div>
          </form>
        )}

        {update.error ? (
          <div className="mt-3 text-sm text-red-600">{update.error.message}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
