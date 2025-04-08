import { cn } from "@cooper/ui";

import CooperLogo from "./cooper-logo";

export default function LoadingResults({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex h-[30dvh] w-full flex-col items-center justify-center",
        className,
      )}
    >
      <CooperLogo width={200} />
      <div className="rounded-lg border-2 border-cooper-blue-800 px-16 py-4 text-xl font-bold text-cooper-blue-600">
        <h2 className="">Loading ...</h2>
      </div>
    </section>
  );
}
