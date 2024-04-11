import HeaderLayout from "~/components/header-layout";
import SearchFilter from "~/components/search-filter";

export default async function Home() {
  return (
    <div className="flex h-[85vh] flex-col">
      <div className="flex h-full flex-col items-center justify-center">
        <SearchFilter />
      </div>
    </div>
  );
}
