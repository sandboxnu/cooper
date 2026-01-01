
/**
 * FormSection component creates a section within a FormCard with a specified title.
 */
export function FormSection({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col rounded-lg w-full">{children}</div>;
}
