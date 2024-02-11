import { ReviewForm } from "~/components/review-form";

export default async function Page() {
  return (
    <div className="container flex h-screen items-center justify-center">
      <ReviewForm />
    </div>
  );
}
