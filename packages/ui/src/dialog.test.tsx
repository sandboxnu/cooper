import React from "react";
import { render, screen } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./dialog";

describe("Dialog", () => {
  test("DialogContent renders with DialogHeader, DialogTitle, DialogDescription", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Dialog title</DialogTitle>
            <DialogDescription>Dialog description text</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(
      screen.getByRole("heading", { name: "Dialog title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Dialog description text")).toBeInTheDocument();
  });

  test("DialogFooter renders children", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogFooter>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  test("DialogHeader applies custom className", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader className="custom-header">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    const header = document.querySelector("[class*='custom-header']");
    expect(header).toBeTruthy();
  });

  test("Dialog opens when trigger is clicked", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button type="button">Open</button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Content</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(
      screen.queryByRole("heading", { name: "Content" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(
      screen.getByRole("heading", { name: "Content" }),
    ).toBeInTheDocument();
  });

  test("DialogClose button is present and clickable", () => {
    render(
      <Dialog open>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <button type="button">Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByRole("heading", { name: "Title" })).toBeInTheDocument();
    const closeBtn = screen.getByRole("button", { name: "Close" });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
  });
});
