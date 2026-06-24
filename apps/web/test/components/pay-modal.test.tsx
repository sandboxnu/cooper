import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { PayModal } from "~/app/_components/roles/modals/pay-modal";

const averages = {
  averageHourlyPay: 25,
  totalReviews: 10,
  pto: 0.5,
  travelBenefits: 0.3,
  freeLunch: 0.8,
};

const payData = {
  averageHourlyPay: 22,
  totalReviews: 10,
  payDistribution: [
    { label: "$20-30", min: 20, max: 30, count: 6 },
    { label: "$30-40", min: 30, max: 40, count: 4 },
  ],
};

describe("PayModal", () => {
  test("compact: shows average pay and benefit rows", () => {
    render(
      <PayModal
        averages={averages}
        globalData={payData}
        industryData={payData}
        industryName="TECHNOLOGY"
        compact
      />,
    );
    expect(screen.getByText("Pay")).toBeInTheDocument();
    expect(screen.getByText("$25/hr")).toBeInTheDocument();
    expect(screen.getByText("PTO")).toBeInTheDocument();
    expect(screen.getByText("Travel Stipend")).toBeInTheDocument();
    expect(screen.getByText("Free Lunch")).toBeInTheDocument();
    // pto 0.5 * 10 = 5 reported
    expect(screen.getByText("5/10 reported")).toBeInTheDocument();
  });

  test("full: shows the histogram heading and tab toggle", () => {
    render(
      <PayModal
        averages={averages}
        globalData={payData}
        industryData={payData}
        industryName="TECHNOLOGY"
      />,
    );
    expect(screen.getByText("Average hourly pay")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Industry" }),
    ).toBeInTheDocument();
  });

  test("full: switching to Industry updates the average legend", () => {
    render(
      <PayModal
        averages={averages}
        globalData={payData}
        industryData={{ ...payData, averageHourlyPay: 18 }}
        industryName="TECHNOLOGY"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Industry" }));
    expect(screen.getByText(/\$18\/hr/)).toBeInTheDocument();
  });
});
