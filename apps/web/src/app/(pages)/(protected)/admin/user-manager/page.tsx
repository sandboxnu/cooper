import { CreateUserForm } from "~/app/_components/admin/create-user-form";
import { AdminUserManagerTable } from "../../../../_components/admin/user-manager-table";

export default function AdminUserManagerPage() {
  return (
    <div className="flex h-full w-full flex-col px-6 py-4">
      <CreateUserForm />
      <AdminUserManagerTable />
    </div>
  );
}
