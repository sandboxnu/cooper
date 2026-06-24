import { describe, expect, test } from "vitest";

import { formatDate, formatLastEditedDate } from "~/utils/dateHelpers";

describe("formatDate", () => {
  test("returns empty string when no date provided", () => {
    expect(formatDate()).toBe("");
  });

  test("formats a date as 'Mth dd, yyyy'", () => {
    // Jan 5, 2024 (month is 0-indexed)
    expect(formatDate(new Date(2024, 0, 5))).toBe("Jan 05, 2024");
  });

  test("pads single-digit days to two digits", () => {
    expect(formatDate(new Date(2023, 11, 9))).toBe("Dec 09, 2023");
  });

  test("handles double-digit days", () => {
    expect(formatDate(new Date(2022, 6, 24))).toBe("Jul 24, 2022");
  });
});

describe("formatLastEditedDate", () => {
  const minutesAgo = (n: number) => new Date(Date.now() - n * 60 * 1000);
  const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  test("returns empty string when neither date provided", () => {
    expect(formatLastEditedDate()).toBe("");
  });

  test("prefers updatedAt over createdAt", () => {
    expect(formatLastEditedDate(minutesAgo(5), daysAgo(10))).toBe(
      "Last edited 5 minutes ago",
    );
  });

  test("falls back to createdAt when updatedAt is null", () => {
    expect(formatLastEditedDate(null, minutesAgo(10))).toBe(
      "Last edited 10 minutes ago",
    );
  });

  test("reports hours when under a day", () => {
    expect(formatLastEditedDate(hoursAgo(3))).toBe("Last edited 3 hours ago");
  });

  test("reports a single day", () => {
    expect(formatLastEditedDate(daysAgo(1))).toBe("Last edited 1 day ago");
  });

  test("reports multiple days when under a week", () => {
    expect(formatLastEditedDate(daysAgo(4))).toBe("Last edited 4 days ago");
  });

  test("falls back to a formatted date when older than a week", () => {
    const old = new Date(2020, 2, 15);
    expect(formatLastEditedDate(old)).toBe(`Last edited ${formatDate(old)}`);
  });
});
