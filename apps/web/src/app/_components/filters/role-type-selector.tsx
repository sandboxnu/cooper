import { Chip } from "@cooper/ui/chip";

interface RoleTypeSelectorProps {
  onSelectedTypeChange: (t: "roles" | "companies" | "all") => void;
  selectedType: "roles" | "companies" | "all";
  data?: {
    totalRolesCount: number;
    totalCompanyCount: number;
  };
  isLoading?: boolean;
}

// Component for selecting role type: All, Jobs, Companies
export default function RoleTypeSelector({
  onSelectedTypeChange,
  selectedType,
  data,
  isLoading,
}: RoleTypeSelectorProps) {
  return (
    <div className="flex gap-2 py-2">
      <Chip
        label={`All`}
        onClick={() => onSelectedTypeChange("all")}
        selected={selectedType === "all"}
      />
      <Chip
        onClick={() => onSelectedTypeChange("roles")}
        label={`Jobs (${isLoading ? "..." : (data?.totalRolesCount ?? "0")})`}
        selected={selectedType === "roles"}
      />
      <Chip
        onClick={() => onSelectedTypeChange("companies")}
        label={`Companies (${isLoading ? "..." : (data?.totalCompanyCount ?? "0")})`}
        selected={selectedType === "companies"}
      />
    </div>
  );
}
