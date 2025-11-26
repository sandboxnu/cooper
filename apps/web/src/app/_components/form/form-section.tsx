import { cn } from "@cooper/ui";

import { FormCard } from "~/app/_components/form/form-card";

/**
 * FormSection component creates a section within a FormCard with a specified title.
 */
export function FormSection({ children }: { children: React.ReactNode }) {
  return <FormCard>{children}</FormCard>;
}
