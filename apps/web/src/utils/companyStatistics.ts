import type { ReviewType } from "@cooper/db/schema";

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
    return { name: toCamelCase(model), percentage, count };
  });
}

export function calculatePay(reviews: ReviewType[] = []) {
  const totalReviews = reviews.length;
  const uniquePay: string[] = [
    ...new Set(reviews.map((r) => r.hourlyPay ?? "0")),
  ];

  return uniquePay.map((pay) => {
    const count = reviews.filter((r) => (r.hourlyPay ?? "0") === pay).length;
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
    .sort((a, b) => a - b);

  if (pays.length === 0) {
    return [{ min: 0, max: 0 }];
  }

  const uniquePays = [...new Set(pays)];

  if (uniquePays.length < 3) {
    return [
      {
        label: "Low",
        min: uniquePays[0] ?? 0,
        max: Math.floor(
          ((uniquePays[uniquePays.length - 1] ?? 0) + (uniquePays[0] ?? 0)) / 2,
        ),
      },
      {
        label: "Mid",
        min: Math.floor(
          ((uniquePays[uniquePays.length - 1] ?? 0) + (uniquePays[0] ?? 0)) / 2,
        ),
        max: uniquePays[uniquePays.length - 1] ?? 0,
      },
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
