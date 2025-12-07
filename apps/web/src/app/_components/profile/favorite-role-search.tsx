"use client";

import { useState } from "react";

import { RoleType } from "@cooper/db/schema";
import { Pagination } from "@cooper/ui";

import { RoleCardPreview } from "../reviews/role-card-preview";
import { Input } from "../themed/onboarding/input";

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

  const totalPages = Math.ceil(favoriteRoles.length / rolesPerPage);
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
        <div className="w-[40%] pb-8 pl-1">
          <Input
            variant="dialogue"
            onChange={(e) => {
              setRoleLabel(e.target.value);
            }}
            className="w-full !border-none !shadow-none !outline-[#EAEAEA]"
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
      <div className="mx-1 grid grid-cols-3 flex-col gap-4 pb-4">
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
