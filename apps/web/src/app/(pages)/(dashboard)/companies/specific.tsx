import { useEffect, useState } from "react";

import SearchFilter from "~/app/_components/search/search-filter";
import { api } from "~/trpc/react";

export default function Company() {
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get("id");
    if (id) {
      setCompanyId(id);
      // fetchCompanyData(id);
      console.log(`Company ID: ${id}`);
    }
  }, []);

  //get all reviews by the specific company id
  // const role = api.role.getById.useQuery({ id: roleObj.id });

  const companyRole = api.role.getByCompany.useQuery({ companyId: companyId });
  const roleData = companyRole.data;

  //get all the companies detail
  const companyQuery = api.company.getById.useQuery({ id: companyId });
  const companyData = companyQuery.data;

  if (companyId != "" || !companyData) {
    //Should update url back to original companies only,
    //should redirect back to companies
    return <div>Loading company details...</div>;
  }

  return (
    <div>
      <SearchFilter />
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center gap-4">
          {/* {companyData ? (
            <Image
              src={`https://logo.clearbit.com/${companyData.name.replace(/\s/g, "")}.com`}
              width={80}
              height={80}
              alt={`Logo of ${companyData.name}`}
              className="rounded-xl border"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl border bg-cooper-blue-200"></div>
          )} */}
          <div>
            <h1 className="text-2xl font-bold">{companyData.name}</h1>
            <p className="text-muted-foreground">
              {companyData.industry} • {companyData.location}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">
              About {companyData.name}
            </h2>
            <p className="text-muted-foreground">{companyData.description}</p>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
            {/* <RatingDisplay
              rating={companyData.rating}
              totalReviews={companyData.totalReviews}
              breakdown={companyData.ratingBreakdown}
            /> */}
          </div>
        </div>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">Job Postings</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* {reviews.isSuccess && reviews.data.length > 0 && (
              <div>
                <div className="pl-6">Reviews:</div>

                {reviews.data.map((review) => {
                  return <ReviewCard reviewObj={review} />;
                })}
            </div>
          )} */}
          </div>
        </section>
      </div>
      {/* <h1>Company Details</h1>
      <p>Company ID: {companyId}</p>
      <p>company photo</p> */}

      {/* Rest of your component */}
    </div>
  );
}
