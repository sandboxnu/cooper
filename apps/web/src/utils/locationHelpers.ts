import type { ReviewType } from "@cooper/db/schema";

import { api } from "~/trpc/react";

export const locationName = (reviewObj: ReviewType) => {
  if (reviewObj.locationId) {
    const { data: location } = api.location.getById.useQuery({
      id: reviewObj.locationId,
    });
    return location
      ? location.city +
          (location.state ? `, ${location.state}` : "") +
          (location.state ? "" : `, ${location.country}`)
      : "N/A";
  }
};

export const abbreviatedStateName = (state: string) => {
  if (state.length === 2) {
    return state.toUpperCase();
  }
  switch (state) {
    case "Alabama":
      return "AL";
    case "Alaska":
      return "AK";
    case "Arizona":
      return "AZ";
    case "Arkansas":
      return "AR";
    case "American Samoa":
      return "AS";
    case "California":
      return "CA";
    case "Colorado":
      return "CO";
    case "Connecticut":
      return "CT";
    case "Delaware":
      return "DE";
    case "District of Columbia":
      return "DC";
    case "Florida":
      return "FL";
    case "Georgia":
      return "GA";
    case "Guam":
      return "GU";
    case "Hawaii":
      return "HI";
    case "Idaho":
      return "ID";
    case "Illinois":
      return "IL";
    case "Indiana":
      return "IN";
    case "Iowa":
      return "IA";
    case "Kansas":
      return "KS";
    case "Kentucky":
      return "KY";
    case "Louisiana":
      return "LA";
    case "Maine":
      return "ME";
    case "Maryland":
      return "MD";
    case "Massachusetts":
      return "MA";
    case "Michigan":
      return "MI";
    case "Minnesota":
      return "MN";
    case "Mississippi":
      return "MS";
    case "Missouri":
      return "MO";
    case "Montana":
      return "MT";
    case "Nebraska":
      return "NE";
    case "Nevada":
      return "NV";
    case "New Hampshire":
      return "NH";
    case "New Jersey":
      return "NJ";
    case "New Mexico":
      return "NM";
    case "New York":
      return "NY";
    case "North Carolina":
      return "NC";
    case "North Dakota":
      return "ND";
    case "North Mariana Islands":
      return "MP";
    case "Ohio":
      return "OH";
    case "Oklahoma":
      return "OK";
    case "Oregon":
      return "OR";
    case "Pennsylvania":
      return "PA";
    case "Puerto Rico":
      return "PR";
    case "Rhode Island":
      return "RI";
    case "South Carolina":
      return "SC";
    case "South Dakota":
      return "SD";
    case "Tennessee":
      return "TN";
    case "Texas":
      return "TX";
    case "Trust Territories":
      return "TT";
    case "Utah":
      return "UT";
    case "Vermont":
      return "VT";
    case "Virginia":
      return "VA";
    case "Virgin Islands":
      return "VI";
    case "Washington":
      return "WA";
    case "West Virginia":
      return "WV";
    case "Wisconsin":
      return "WI";
    case "Wyoming":
      return "WY";
    default:
      return state;
  }
};
