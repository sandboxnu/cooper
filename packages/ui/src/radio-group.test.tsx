import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  test("renders radio group with items", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAttribute("value", "a");
    expect(radios[1]).toHaveAttribute("value", "b");
  });

  test("applies className to group", () => {
    const { container } = render(
      <RadioGroup defaultValue="a" className="custom-group">
        <RadioGroupItem value="a" id="a" />
      </RadioGroup>,
    );
    const group = container.firstChild as HTMLElement;
    expect(group).toHaveClass("custom-group");
  });

  test("selects item when clicked", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" />
        <RadioGroupItem value="b" id="b" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
    fireEvent.click(radios[1]);
    expect(radios[1]).toBeChecked();
  });

  test("RadioGroupItem applies className", () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" id="a" className="custom-item" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    expect(radio.closest(".custom-item")).toBeInTheDocument();
  });
});
