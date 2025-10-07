"use client";
import { RoleType } from "@cooper/db/schema";
import { Input } from "../themed/onboarding/input";
import { useState } from "react";
import { RoleCardPreview } from "../reviews/role-card-preview";
import { Pagination } from "@cooper/ui";

export default function FavoriteRoleSearch({
  favoriteRoles,
}: {
  favoriteRoles: (RoleType | undefined)[];
}) {
  const [roleLabel, setRoleLabel] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 9;
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = favoriteRoles
    ? Math.ceil(favoriteRoles.length / rolesPerPage)
    : 0;
  const prefixedRoles = roleLabel
    ? favoriteRoles.filter(
        (role) =>
          role?.title.substring(0, roleLabel.length).toLowerCase() ===
          roleLabel.toLowerCase(),
      )
    : favoriteRoles;
  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className="w-[40%] pl-1 pb-8">
          <Input
            variant="dialogue"
            onChange={(e) => {
              setRoleLabel(e.target.value);
            }}
            className="w-full"
            placeholder="Search for a saved role..."
          />
        </div>
        <div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
      <div className="mx-1 flex-col gap-4 grid grid-cols-3 pb-4 ">
        {prefixedRoles.length > 0 ? (
          prefixedRoles
            .slice(
              (currentPage - 1) * rolesPerPage,
              (currentPage - 1) * rolesPerPage + rolesPerPage,
            )
            .filter(
              (role): role is NonNullable<typeof role> => role !== undefined,
            )
            .map((company) => <RoleCardPreview roleObj={company} />)
        ) : (
          <p className="italic text-cooper-gray-400">No saved roles found.</p>
        )}
      </div>
    </div>
  );
}
