import { FormCard } from "~/components/form/form-card";
import { cn } from "~/lib/utils";

/**
 * FormSection component creates a section within a FormCard with a specified title.
 */
export function FormSection({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <FormCard>
      <h2 className={cn("text-5xl font-bold", className)}>{title}</h2>
      {children}
    </FormCard>
  );
}
