export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col space-y-4 rounded-xl bg-white p-8">
      {children}
    </div>
  );
}
