"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { RoleType } from "@cooper/db/schema";
import { Pagination } from "@cooper/ui";

import { api } from "~/trpc/react";
import { RoleCardPreview } from "../roles/role-card-preview";
import { SAVED_CARD_WIDTH_CLASS, isInsideButton } from "./saved-card";

// Opens the role in the roles page results, like a search result card
function SavedRoleCard({ role }: { role: RoleType }) {
  const router = useRouter();
  const { data: company } = api.company.getById.useQuery({
    id: role.companyId,
  });

  return (
    <div
      className={SAVED_CARD_WIDTH_CLASS}
      onClick={(event) => {
        // The save button toggles the favorite without leaving the page
        if (isInsideButton(event) || !company) return;
        router.push(
          `/roles/?company=${company.slug}&type=roles&role=${role.slug}`,
        );
      }}
    >
      <RoleCardPreview roleObj={role} />
    </div>
  );
}

export default function FavoriteRoleSearch({
  favoriteRoles,
}: {
  favoriteRoles: (RoleType | undefined)[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 9;
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(favoriteRoles.length / rolesPerPage);
  return (
    <div>
      <div className="flex justify-end pb-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      {/* Search-result-width cards with the results' 8px gap, wrapping */}
      <div className="mx-1 flex flex-wrap gap-2 pb-4">
        {favoriteRoles.length > 0 ? (
          favoriteRoles
            .slice(
              (currentPage - 1) * rolesPerPage,
              (currentPage - 1) * rolesPerPage + rolesPerPage,
            )
            .filter(
              (role): role is NonNullable<typeof role> => role !== undefined,
            )
            .map((role) => <SavedRoleCard key={role.id} role={role} />)
        ) : (
          <p className="italic text-cooper-gray-400">No saved roles found.</p>
        )}
      </div>
    </div>
  );
}
