import Header from "~/components/header";
import SearchFilter from "~/components/search-filter";

export default async function Home() {
  return (
    <div className="flex h-[85vh] flex-col">
      <Header />
      <div className="flex h-full flex-col items-center justify-center">
        <p className="mb-8 text-2xl font-semibold">
          Search your dream co-op role!
        </p>
        <SearchFilter />
      </div>
    </div>
  );
}
