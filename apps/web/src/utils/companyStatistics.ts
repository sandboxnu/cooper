import type { ReviewType } from "@cooper/db/schema";

import { prettyWorkEnviornment } from "./stringHelpers";

function toCamelCase(word: string) {
  return word.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function calculateWorkModels(reviews: ReviewType[] = []) {
  const totalReviews = reviews.length;
  const uniqueModels: string[] = [
    ...new Set(reviews.map((r) => r.workEnvironment)),
  ];

  return uniqueModels.map((model) => {
    const count = reviews.filter((r) => r.workEnvironment === model).length;
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    const name = prettyWorkEnviornment(
      model as "INPERSON" | "HYBRID" | "REMOTE",
    );
    return { name, percentage, count };
  });
}

export function calculateJobTypes(reviews: ReviewType[] = []) {
  const totalReviews = reviews.length;
  const uniqueTypes: string[] = [...new Set(reviews.map((r) => r.jobType))];

  return uniqueTypes.map((model) => {
    const count = reviews.filter((r) => r.jobType === model).length;
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { name: toCamelCase(model), percentage, count };
  });
}

export function calculatePay(reviews: ReviewType[] = []) {
  const reviewsWithPay = reviews.filter(
    (r) => r.hourlyPay != null && r.hourlyPay !== "" && Number(r.hourlyPay) > 0,
  );
  const totalReviews = reviewsWithPay.length;
  if (totalReviews === 0) return [];

  const payByValue = new Map<number, number>();
  for (const r of reviewsWithPay) {
    const value = Number(r.hourlyPay);
    if (!Number.isNaN(value)) {
      payByValue.set(value, (payByValue.get(value) ?? 0) + 1);
    }
  }

  return [...payByValue.entries()].map(([payNum, count]) => {
    const pay = String(payNum);
    const percentage =
      totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { pay, percentage, count };
  });
}

interface PayRange {
  label?: string;
  min: number;
  max: number;
}

export function calculatePayRange(reviews: ReviewType[] = []): PayRange[] {
  const pays = reviews
    .map((r) => Number(r.hourlyPay ?? 0))
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b);

  if (pays.length === 0) {
    return [{ min: 0, max: 0 }];
  }

  const uniquePays = [...new Set(pays)];

  if (uniquePays.length === 1) {
    const only = uniquePays[0] ?? 0;
    return [{ label: "Pay", min: only, max: only }];
  }
  if (uniquePays.length === 2) {
    const low = uniquePays[0] ?? 0;
    const high = uniquePays[1] ?? 0;
    const mid = Math.floor((low + high) / 2);
    return [
      { label: "Low", min: low, max: mid },
      { label: "Mid", min: mid + 1, max: high },
    ];
  }

  const min = uniquePays[0] ?? 0;
  const max = uniquePays[uniquePays.length - 1] ?? 0;
  const span = max - min;

  const slice = span / 3;

  return [
    {
      label: "Low",
      min,
      max: Math.floor(min + slice),
    },
    {
      label: "Mid",
      min: Math.floor(min + slice) + 1,
      max: Math.floor(min + 2 * slice),
    },
    {
      label: "High",
      min: Math.floor(min + 2 * slice) + 1,
      max,
    },
  ];
}
