import Header from "~/components/header";
import SearchFilter from "~/components/search-filter";

export default async function Companies() {
  return (
    <div className="flex h-full flex-col">
      <Header />

      <div className="mx-12 mt-16 flex flex-col">
        <SearchFilter />
      </div>
    </div>
  );
}
