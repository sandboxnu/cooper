import CooperLogo from "./cooper-logo";

export default function LoadingResults() {
  return (
    <section className="flex h-[50dvh] w-full flex-col items-center justify-center">
      <CooperLogo />
      <div className="rounded-lg border-2 border-cooper-blue-600 px-16 pb-4 pt-6 text-xl font-bold text-cooper-blue-700">
        <h2 className="">Loading ...</h2>
      </div>
    </section>
  );
}
