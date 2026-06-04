import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../src/dropdown-menu";

// Radix relies on pointer-capture/scroll APIs that jsdom does not implement.
const proto = Element.prototype as Partial<Element>;
if (!proto.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!proto.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

// `forceMount` keeps the portalled content (and its items) in the tree so the
// wrapper render bodies execute without needing to drive the open animation.
function renderMenu() {
  return render(
    <DropdownMenu open>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent forceMount className="custom-content">
        <DropdownMenuLabel>Plain label</DropdownMenuLabel>
        <DropdownMenuLabel inset>Inset label</DropdownMenuLabel>
        <DropdownMenuItem>Plain item</DropdownMenuItem>
        <DropdownMenuItem inset>Inset item</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked className="custom-checkbox">
          Checkbox item
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a" className="custom-radio">
            Radio item
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator className="custom-separator" />
        <DropdownMenuShortcut className="custom-shortcut">
          ⌘K
        </DropdownMenuShortcut>
        <DropdownMenuGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>Sub trigger</DropdownMenuSubTrigger>
            <DropdownMenuSubTrigger inset>
              Inset sub trigger
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent forceMount className="custom-subcontent">
              <DropdownMenuItem>Sub item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
}

describe("DropdownMenu wrappers", () => {
  test("render every menu item variant", () => {
    renderMenu();
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Plain label")).toBeInTheDocument();
    expect(screen.getByText("Inset label")).toBeInTheDocument();
    expect(screen.getByText("Plain item")).toBeInTheDocument();
    expect(screen.getByText("Inset item")).toBeInTheDocument();
    expect(screen.getByText("Checkbox item")).toBeInTheDocument();
    expect(screen.getByText("Radio item")).toBeInTheDocument();
    expect(screen.getByText("⌘K")).toBeInTheDocument();
    expect(screen.getByText("Sub trigger")).toBeInTheDocument();
    expect(screen.getByText("Inset sub trigger")).toBeInTheDocument();
    expect(screen.getByText("Sub item")).toBeInTheDocument();
  });

  test("forwards custom class names onto the rendered nodes", () => {
    renderMenu();
    expect(document.querySelector(".custom-content")).not.toBeNull();
    expect(document.querySelector(".custom-checkbox")).not.toBeNull();
    expect(document.querySelector(".custom-radio")).not.toBeNull();
    expect(document.querySelector(".custom-separator")).not.toBeNull();
    expect(document.querySelector(".custom-subcontent")).not.toBeNull();
  });

  test("the shortcut applies its default opacity classes", () => {
    renderMenu();
    const shortcut = screen.getByText("⌘K");
    expect(shortcut).toHaveClass("custom-shortcut");
    expect(shortcut).toHaveClass("ml-auto");
  });

  test("inset variants add left padding", () => {
    renderMenu();
    expect(screen.getByText("Inset item")).toHaveClass("pl-8");
    expect(screen.getByText("Inset label")).toHaveClass("pl-8");
  });
});
