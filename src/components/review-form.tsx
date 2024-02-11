"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { ReviewSection } from "~/components/review-section";
import { CoopCycleSection } from "~/components/coop-cycle-section";

const formSchema = z.object({
  coopCycle: z.enum(["Fall", "Spring", "Other..."], {
    required_error: "You need to select a co-op cycle.",
  }),
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
      coopCycle: "Fall",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CoopCycleSection />
        <ReviewSection />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
