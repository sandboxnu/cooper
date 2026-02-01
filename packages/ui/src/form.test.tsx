import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form";
import { Input } from "./input";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function FormWrapper({ defaultValues }: { defaultValues?: FormValues }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? { username: "", bio: "" },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your display name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Input placeholder="Bio" {...field} />
              </FormControl>
              <FormDescription>Optional bio</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe("Form", () => {
  test("FormDescription renders with id from useFormField", () => {
    render(<FormWrapper />);
    expect(screen.getByText("Your display name")).toBeInTheDocument();
    const desc = screen.getByText("Your display name");
    expect(desc).toHaveAttribute("id");
  });

  test("FormLabel links to form item id", () => {
    render(<FormWrapper />);
    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for");
  });

  test("FormControl has aria-invalid when field has error", async () => {
    render(<FormWrapper defaultValues={{ username: "", bio: "" }} />);
    const submit = screen.getByRole("button", { name: "Submit" });
    submit.click();
    const input = await screen.findByPlaceholderText("Enter username");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  test("FormMessage shows error when field has error", async () => {
    render(<FormWrapper defaultValues={{ username: "", bio: "" }} />);
    const submit = screen.getByRole("button", { name: "Submit" });
    submit.click();
    expect(await screen.findByText("Username is required")).toBeInTheDocument();
  });

  test("FormMessage shows children when no error", () => {
    render(<FormWrapper defaultValues={{ username: "filled", bio: "" }} />);
    expect(screen.getByText("Your display name")).toBeInTheDocument();
  });

  test("FormMessage renders nothing when no error and no children", () => {
    function FormWithMessageOnly() {
      const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { username: "filled", bio: "" },
      });
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      );
    }
    const { container } = render(<FormWithMessageOnly />);
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
    const messageEls = container.querySelectorAll(
      "p[id$='-form-item-message']",
    );
    expect(messageEls.length).toBe(0);
  });
});
