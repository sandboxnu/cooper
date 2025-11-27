/**
 * FormCard component provides a structured container to organize form elements.
 */
export function FormCard({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col rounded-lg bg-white">{children}</div>;
}
