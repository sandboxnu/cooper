import { ReviewForm } from "~/components/review-form";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="container flex items-center justify-center py-10">
      <ReviewForm />
    </div>
  );
}
