// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/unbound-method */
// import { beforeEach, describe, expect, test, vi } from "vitest";

// import type { Session } from "@cooper/auth";
// import type { CompanyType } from "@cooper/db/schema";
// import { and, eq } from "@cooper/db";
// import { db } from "@cooper/db/client";
// import { Company } from "@cooper/db/schema";

// import { appRouter } from "../src/root";
// import { createCallerFactory, createTRPCContext } from "../src/trpc";
// import { data } from "./mocks/company";

// vi.mock("@cooper/db/client", () => ({
//   db: {
//     query: {
//       Review: {
//         findMany: vi.fn(),
//       },
//     },
//   },
// }));

// vi.mock("@cooper/auth", () => ({
//   auth: vi.fn(),
// }));

// describe("Company Router", async () => {
//   beforeEach(() => {
//     vi.restoreAllMocks();
//     vi.mocked(db.query.Company.findMany).mockResolvedValue(data as CompanyType[]);
//   });

//   const session: Session = {
//     user: {
//       id: "1",
//     },
//     expires: "1",
//   };

//   const ctx = await createTRPCContext({
//     session,
//     headers: new Headers(),
//   });

//   const caller = createCallerFactory(appRouter)(ctx);

//   test("list endpoint returns all companies", async () => {
//     const companies = await caller.review.list({});

//     expect(companies).toEqual(data);

//     expect(db.query.Review.findMany).toHaveBeenCalledWith({
//       orderBy: expect.anything(),
//       where: undefined,
//     });
//   });

//   test("list endpoint with filtered companies", async () => {
//     await caller.review.list({
//         search: "kin"
//     });

//     expect(db.query.Review.findMany).toHaveBeenCalledWith({
//       orderBy: expect.anything(),
//       where: and(eq(Review.workTerm, "SPRING")),
//     });
//   });


// });
