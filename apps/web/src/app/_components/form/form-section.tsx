import { cn } from "@cooper/ui";

/**
 * FormSection stacks a review form section's fields with even spacing.
 */
export function FormSection({ children }: { children: React.ReactNode }) {
  // More space between fields on mobile; matches FieldRow
  return (
    <div className="flex w-full flex-col gap-7 sm:gap-5">{children}</div>
  );
}

/**
 * One titled part of the review form (Basic information, Pay, ...).
 * - "divider" (pop-up): sections after the first get a line above; stack in
 *   a gap-8 column.
 * - "card" (review form page): each section is its own white card, like the
 *   role page's sections.
 */
export function FormSectionBlock({
  title,
  id,
  variant = "divider",
  divider = true,
  children,
}: {
  title: string;
  // Anchor for the review form's section list
  id?: string;
  variant?: "divider" | "card";
  divider?: boolean;
  children: React.ReactNode;
}) {
  if (variant === "card") {
    return (
      <section
        id={id}
        className="flex scroll-mt-6 flex-col gap-4 rounded-lg border border-cooper-gray-125 bg-white px-6 py-5"
      >
        <h2 className="text-lg font-medium tracking-[-0.18px] text-cooper-gray-900">
          {title}
        </h2>
        {children}
      </section>
    );
  }
  return (
    <section
      id={id}
      className={cn(
        "flex flex-col gap-4",
        divider && "border-t border-cooper-gray-150 pt-8",
      )}
    >
      <h2 className="text-base font-semibold text-cooper-gray-900">{title}</h2>
      {children}
    </section>
  );
}
