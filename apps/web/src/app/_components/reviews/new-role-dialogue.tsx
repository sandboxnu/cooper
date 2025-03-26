import { Button } from "@cooper/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cooper/ui/dialog";
import { Input } from "@cooper/ui/input";
import { Label } from "@cooper/ui/label";
import { Textarea } from "@cooper/ui/textarea";

import { api } from "~/trpc/react";

interface NewRoleDialogProps {
  companyId: string;
}

export default function NewRoleDialog({ companyId }: NewRoleDialogProps) {
  const company = api.company.getById.useQuery({ id: companyId });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-full border-none border-cooper-yellow-500 bg-cooper-yellow-500 px-4 py-3 text-sm font-semibold text-white hover:border-cooper-yellow-300 hover:bg-cooper-yellow-300">
          + Create New Role
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white w-full">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Request a new role for {company.data?.name}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div className="flex flex-col gap-4 py-4">
            <div>
              <Label>Role Name</Label>
              <Input type="string" variant="dialogue" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea variant="dialogue" />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="submit"
            className="border-none bg-cooper-blue-400 text-white hover:bg-cooper-blue-600"
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
