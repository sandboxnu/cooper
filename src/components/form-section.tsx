import { FormCard } from "~/components/form-card";

/**
 * FormSection component creates a section within a FormCard with a specified title.
 */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FormCard>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {children}
    </FormCard>
  );
}
