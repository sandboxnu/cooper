"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { cn } from "@cooper/ui";

// Review form sections, in page order. `required` decides when a section
// counts as done in the progress list.
export const REVIEW_FORM_SECTIONS = [
  {
    id: "basic-information",
    title: "Basic information",
    required: [
      "companyName",
      "roleName",
      "jobType",
      "workTerm",
      "workYear",
      "jobLength",
      "locationId",
    ],
  },
  {
    id: "on-the-job",
    title: "On the job",
    required: [
      "workEnvironment",
      "workHours",
      "federalHolidays",
      "drugTest",
      "accessibleByTransportation",
    ],
  },
  {
    id: "pay",
    title: "Pay",
    required: ["hourlyPay", "overtimeNormal", "pto"],
  },
  // Interview rounds are optional: done once at least one round is added
  { id: "interview", title: "Interview", required: [] },
  {
    id: "review-and-rate",
    title: "Review and rate",
    required: ["overallRating", "textReview"],
  },
] as const;

export type ReviewFormSectionId = (typeof REVIEW_FORM_SECTIONS)[number]["id"];

function isFilled(value: unknown) {
  return value !== undefined && value !== null && value !== "" && value !== 0;
}

// How far below the scroll area's top a section must start to be "current"
const ACTIVE_OFFSET = 120;

/**
 * Sticky list of review form sections beside the form: shows which are done,
 * highlights the one in view, and scrolls to a section on click.
 */
export function ReviewFormNav({
  scrollRootRef,
}: {
  scrollRootRef: React.RefObject<HTMLElement | null>;
}) {
  const form = useFormContext();
  // Re-render on every change so done states stay current
  const values = form.watch() as Record<string, unknown>;
  const [activeId, setActiveId] = useState<ReviewFormSectionId>(
    REVIEW_FORM_SECTIONS[0].id,
  );

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const update = () => {
      const rootTop = root.getBoundingClientRect().top;
      const atBottom =
        root.scrollTop + root.clientHeight >= root.scrollHeight - 4;
      let current: ReviewFormSectionId = REVIEW_FORM_SECTIONS[0].id;
      for (const section of REVIEW_FORM_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top - rootTop <= ACTIVE_OFFSET) {
          current = section.id;
        }
      }
      const lastSection = REVIEW_FORM_SECTIONS.at(-1);
      if (atBottom && lastSection) current = lastSection.id;
      setActiveId(current);
    };

    update();
    root.addEventListener("scroll", update, { passive: true });
    return () => root.removeEventListener("scroll", update);
  }, [scrollRootRef]);

  const isDone = (section: (typeof REVIEW_FORM_SECTIONS)[number]) => {
    if (section.id === "interview") {
      // The form always seeds two blank rounds, so array length alone can't
      // tell "done" apart from "untouched" — match the server's definition
      // of a real round (both fields filled in).
      const rounds = values.interviewRounds as
        | { interviewType?: unknown; interviewDifficulty?: unknown }[]
        | undefined;
      return (
        rounds?.some(
          (r) => r.interviewType != null && r.interviewDifficulty != null,
        ) ?? false
      );
    }
    return section.required.every((field) => isFilled(values[field]));
  };

  return (
    <nav
      aria-label="Review form sections"
      className="sticky top-10 hidden w-48 shrink-0 lg:block"
    >
      <ol className="flex flex-col gap-1">
        {REVIEW_FORM_SECTIONS.map((section) => {
          const done = isDone(section);
          const active = section.id === activeId;
          return (
            <li key={section.id}>
              <button
                type="button"
                aria-current={active ? "step" : undefined}
                onClick={() =>
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className={cn(
                  // Darker cream than the page; #F6F6F6 barely shows on cream-100
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-cooper-cream-300",
                  active
                    ? "bg-white font-semibold text-cooper-gray-900"
                    : "text-cooper-gray-400",
                )}
              >
                <span
                  className={cn(
                    "flex size-[18px] shrink-0 items-center justify-center rounded-full border",
                    done
                      ? "border-cooper-gray-550 bg-cooper-gray-550 text-white"
                      : "border-cooper-gray-600 bg-white",
                  )}
                >
                  {done && <Check className="size-3" strokeWidth={3} />}
                </span>
                {section.title}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
