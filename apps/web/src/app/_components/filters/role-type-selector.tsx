import { Chip } from "@cooper/ui/chip";

interface RoleTypeSelectorProps {
  onSelectedTypeChange: (t: "roles" | "companies" | "all") => void;
  selectedType: "roles" | "companies" | "all";
}

// Component for selecting role type: All, Jobs, Companies
export default function RoleTypeSelector({
  onSelectedTypeChange,
  selectedType,
}: RoleTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      <Chip
        label={`All`}
        onClick={() => onSelectedTypeChange("all")}
        selected={selectedType === "all"}
      />
      <Chip
        onClick={() => {selectedType === "roles" ? onSelectedTypeChange("all") : onSelectedTypeChange("roles")}}
        label={`Jobs`}
        selected={selectedType === "roles"}
      />
      <Chip
        onClick={() => {selectedType === "companies" ? onSelectedTypeChange("all") : onSelectedTypeChange("companies")}}
        label={`Companies`}
        selected={selectedType === "companies"}
      />
    </div>
  );
}
