import HeaderLayout from "~/components/header-layout";
import SearchFilter from "~/components/search-filter";

export default async function Companies() {
  return (
    <div className="flex h-full flex-col">
      <HeaderLayout>
        <SearchFilter />
      </HeaderLayout>
    </div>
  );
}
