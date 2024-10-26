import { auth } from "@cooper/auth";

import { OnboardingDialog } from "~/app/_components/onboarding/dialog";
import SearchFilter from "~/app/_components/search/search-filter";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex h-[85vh] flex-col">
      <div className="flex h-full flex-col items-center justify-center">
        <SearchFilter />
        <OnboardingDialog isOpen session={session} />
      </div>
    </div>
  );
}
