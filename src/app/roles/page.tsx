import { RoleReviewCard } from "~/components/role-review-card";

export default async function Roles() {
  return (
    <div className="flex h-screen items-center justify-center">
      <RoleReviewCard description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Soluta nulla error adipisci labore consequatur quos perspiciatis, quis veniam quae saepe sint pariatur eum provident blanditiis facere in tempore, facilis illum." />
      <RoleReviewCard description="Lorem, ipsum dolor sit amet consectetur adipisicing elit." />
      <RoleReviewCard description="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Soluta nulla error adipisci labore consequatur quos perspiciatis, quis veniam quae saepe sint pariatur eum provident blanditiis facere in tempore, facilis illum. Lorem, ipsum dolor sit amet consectetur adipisicing elit. Soluta nulla error adipisci labore consequatur quos perspiciatis, quis veniam quae saepe sint pariatur eum provident blanditiis facere in tempore, facilis illum." />
    </div>
  );
}
