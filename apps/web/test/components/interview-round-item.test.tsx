import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/app/_components/filters/filter-body", () => ({
  default: ({
    title,
    selectedOptions,
    onSelectionChange,
  }: {
    title: string;
    selectedOptions: string[];
    onSelectionChange: (selected: string[]) => void;
  }) => (
    <div data-testid="filter-body" data-title={title}>
      <span data-testid={`selected-${title}`}>{selectedOptions[0] ?? ""}</span>
      <button
        data-testid={`select-${title}`}
        onClick={() =>
          onSelectionChange([title === "Difficulty" ? "hard" : "technical"])
        }
      >
        select
      </button>
      <button
        data-testid={`clear-${title}`}
        onClick={() => onSelectionChange([])}
      >
        clear
      </button>
    </div>
  ),
}));

import { InterviewRoundItem } from "~/app/_components/form/sections/interview-round-item";

function Wrapper({ children }: { children: ReactNode }) {
  const form = useForm({ defaultValues: { interviewRounds: [{}] } });
  return <FormProvider {...form}>{children}</FormProvider>;
}

describe("InterviewRoundItem", () => {
  test("renders the round number (1-indexed) and field labels", () => {
    render(
      <Wrapper>
        <InterviewRoundItem index={0} onRemove={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText("Round 1")).toBeInTheDocument();
    expect(screen.getByText("Interview type")).toBeInTheDocument();
    expect(screen.getByText("Difficulty")).toBeInTheDocument();
  });

  test("renders a filter body for both selects", () => {
    render(
      <Wrapper>
        <InterviewRoundItem index={2} onRemove={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByText("Round 3")).toBeInTheDocument();
    expect(screen.getAllByTestId("filter-body")).toHaveLength(2);
  });

  test("fires onRemove when the X button is clicked", () => {
    const onRemove = vi.fn();
    render(
      <Wrapper>
        <InterviewRoundItem index={0} onRemove={onRemove} />
      </Wrapper>,
    );
    // The X button is the only role="button"; the filter-body selects are
    // queried by test id, so this resolves unambiguously.
    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  test("selecting an interview type writes the value back into the field", () => {
    render(
      <Wrapper>
        <InterviewRoundItem index={0} onRemove={vi.fn()} />
      </Wrapper>,
    );
    expect(screen.getByTestId("selected-Interview type")).toHaveTextContent("");
    fireEvent.click(screen.getByTestId("select-Interview type"));
    expect(screen.getByTestId("selected-Interview type")).toHaveTextContent(
      "technical",
    );
  });

  test("clearing the interview type resets the field to undefined", () => {
    render(
      <Wrapper>
        <InterviewRoundItem index={0} onRemove={vi.fn()} />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId("select-Interview type"));
    expect(screen.getByTestId("selected-Interview type")).toHaveTextContent(
      "technical",
    );
    fireEvent.click(screen.getByTestId("clear-Interview type"));
    expect(screen.getByTestId("selected-Interview type")).toHaveTextContent("");
  });

  test("selecting and clearing the difficulty updates the field", () => {
    render(
      <Wrapper>
        <InterviewRoundItem index={0} onRemove={vi.fn()} />
      </Wrapper>,
    );
    fireEvent.click(screen.getByTestId("select-Difficulty"));
    expect(screen.getByTestId("selected-Difficulty")).toHaveTextContent("hard");
    fireEvent.click(screen.getByTestId("clear-Difficulty"));
    expect(screen.getByTestId("selected-Difficulty")).toHaveTextContent("");
  });
});
