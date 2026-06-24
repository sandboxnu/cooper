import { describe, expect, test, vi } from "vitest";

import type { LocationType } from "@cooper/db/schema";

// locationHelpers imports the tRPC react client at module load; stub it so the
// module can be imported in a test environment without a real tRPC provider.
vi.mock("~/trpc/react", () => ({
  api: {
    location: {
      getById: {
        useQuery: () => ({ data: undefined }),
      },
    },
  },
}));

const { abbreviatedStateName, prettyLocationName } = await import(
  "~/utils/locationHelpers"
);

const location = (overrides: Partial<LocationType> = {}): LocationType =>
  ({
    city: "Boston",
    state: "Massachusetts",
    country: "USA",
    ...overrides,
  }) as LocationType;

describe("prettyLocationName", () => {
  test("returns 'N/A' when no location is given", () => {
    expect(prettyLocationName(undefined)).toBe("N/A");
  });

  test("renders city and abbreviated state when a state exists", () => {
    expect(prettyLocationName(location({ state: "Massachusetts" }))).toBe(
      "Boston, MA",
    );
  });

  test("renders city and country when there is no state", () => {
    expect(
      prettyLocationName(
        location({ city: "Toronto", state: "", country: "Canada" }),
      ),
    ).toBe("Toronto, Canada");
  });
});

describe("abbreviatedStateName", () => {
  test("upper-cases an already-abbreviated two-letter state", () => {
    expect(abbreviatedStateName("ny")).toBe("NY");
  });

  test("returns the input unchanged for unknown full names", () => {
    expect(abbreviatedStateName("Atlantis")).toBe("Atlantis");
  });

  const states: [string, string][] = [
    ["Alabama", "AL"],
    ["Alaska", "AK"],
    ["Arizona", "AZ"],
    ["Arkansas", "AR"],
    ["American Samoa", "AS"],
    ["California", "CA"],
    ["Colorado", "CO"],
    ["Connecticut", "CT"],
    ["Delaware", "DE"],
    ["District of Columbia", "DC"],
    ["Florida", "FL"],
    ["Georgia", "GA"],
    ["Guam", "GU"],
    ["Hawaii", "HI"],
    ["Idaho", "ID"],
    ["Illinois", "IL"],
    ["Indiana", "IN"],
    ["Iowa", "IA"],
    ["Kansas", "KS"],
    ["Kentucky", "KY"],
    ["Louisiana", "LA"],
    ["Maine", "ME"],
    ["Maryland", "MD"],
    ["Massachusetts", "MA"],
    ["Michigan", "MI"],
    ["Minnesota", "MN"],
    ["Mississippi", "MS"],
    ["Missouri", "MO"],
    ["Montana", "MT"],
    ["Nebraska", "NE"],
    ["Nevada", "NV"],
    ["New Hampshire", "NH"],
    ["New Jersey", "NJ"],
    ["New Mexico", "NM"],
    ["New York", "NY"],
    ["North Carolina", "NC"],
    ["North Dakota", "ND"],
    ["North Mariana Islands", "MP"],
    ["Ohio", "OH"],
    ["Oklahoma", "OK"],
    ["Oregon", "OR"],
    ["Pennsylvania", "PA"],
    ["Puerto Rico", "PR"],
    ["Rhode Island", "RI"],
    ["South Carolina", "SC"],
    ["South Dakota", "SD"],
    ["Tennessee", "TN"],
    ["Texas", "TX"],
    ["Trust Territories", "TT"],
    ["Utah", "UT"],
    ["Vermont", "VT"],
    ["Virginia", "VA"],
    ["Virgin Islands", "VI"],
    ["Washington", "WA"],
    ["West Virginia", "WV"],
    ["Wisconsin", "WI"],
    ["Wyoming", "WY"],
  ];

  test.each(states)("maps %s to %s", (full, abbr) => {
    expect(abbreviatedStateName(full)).toBe(abbr);
  });
});
