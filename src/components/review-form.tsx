"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

const formSchema = z.object({
  reviewHeadline: z.string().min(8, {
    message: "The review headline must be at least 8 characters.",
  }),
  pros: z.string().min(8, {
    message: "Pros must be at least 8 characters.",
  }),
  cons: z.string().min(8, {
    message: "Cons must be at least 8 characters.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  hourlyPay: z.coerce.number(),
});

export function ReviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reviewHeadline: "",
      pros: "",
      cons: "",
      location: "",
      hourlyPay: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <div className="flex flex-col space-y-4 rounded-xl bg-white p-8">
      <h2 className="text-2xl font-semibold">Review</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="reviewHeadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Headline*</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pros"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pros*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Talk about some pros of working at [company]."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cons*</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Talk about some cons of working at [company]."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between space-x-2">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hourlyPay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Pay (USD)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" variant="outline">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
