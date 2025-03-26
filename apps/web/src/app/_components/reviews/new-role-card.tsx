import { Card, CardContent, CardHeader, CardTitle } from "@cooper/ui/card";

import NewRoleDialog from "./new-role-dialogue";

interface NewRoleCardProps {
  companyId: string;
}

export default function NewRoleCard({ companyId }: NewRoleCardProps) {
  return (
    <Card
      className={
        "mb-4 flex h-fit w-[100%] flex-col justify-between overflow-hidden rounded-xl outline outline-[1px] outline-[#474747]"
      }
    >
      <CardHeader className="mt-1.5 pb-3">
        <CardTitle className="text-md flex items-center justify-start gap-3 space-x-4 md:text-xl">
          Don't see your role?
        </CardTitle>
      </CardHeader>
      <CardContent className="mb-1.5 grid gap-2">
        <NewRoleDialog companyId={companyId} />
      </CardContent>
    </Card>
  );
}
