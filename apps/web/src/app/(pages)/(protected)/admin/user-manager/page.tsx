import { CreateUserForm } from "~/app/_components/admin/create-user-form";
import { AdminUserManagerTable } from "../../../../_components/admin/user-manager-table";

export default function AdminUserManagerPage() {
  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden flex-col px-6 py-4 flex-1">
      <CreateUserForm />
      <AdminUserManagerTable />
    </div>
  );
}
