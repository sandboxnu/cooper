import { Chip } from "@cooper/ui/chip";

interface RoleTypeSelectorProps {
  onSelectedTypeChange: (t: "roles" | "companies" | "all") => void;
  selectedType: "roles" | "companies" | "all";
  data?: {
    totalRolesCount: number;
    totalCompanyCount: number;
  };
}

// Component for selecting role type: All, Jobs, Companies
export default function RoleTypeSelector({
  onSelectedTypeChange,
  selectedType,
  data,
}: RoleTypeSelectorProps) {
  return (
    <div className="flex gap-2 py-2">
      <Chip
        label={`All (${(data?.totalRolesCount || 0) + (data?.totalCompanyCount || 0)})`}
        onClick={() => onSelectedTypeChange("all")}
        selected={selectedType === "all"}
      />
      <Chip
        onClick={() => onSelectedTypeChange("roles")}
        label={`Jobs (${data?.totalRolesCount || "0"})`}
        selected={selectedType === "roles"}
      />
      <Chip
        onClick={() => onSelectedTypeChange("companies")}
        label={`Companies (${data?.totalCompanyCount || "0"})`}
        selected={selectedType === "companies"}
      />
    </div>
  );
}
